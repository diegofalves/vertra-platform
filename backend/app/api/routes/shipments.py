from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.models.schemas import ShipmentRecordCreate, ShipmentRecordResponse
from app.services.database import execute, fetch_all, fetch_one
from app.services.geocoding_service import geocode_batch

router = APIRouter()


def _row_to_shipment(row) -> dict:
    return dict(row)


@router.get("/projects/{project_id}/shipments", response_model=list[ShipmentRecordResponse])
async def list_shipments(project_id: UUID, skip: int = 0, limit: int = 200):
    project = await fetch_one(
        "SELECT id, organization_id FROM projects WHERE id = $1 AND deleted_at IS NULL", project_id
    )
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    rows = await fetch_all(
        """
        SELECT id, project_id, organization_id, nf_number, nf_date, nf_value,
               sender_name, sender_city, sender_state,
               recipient_name, recipient_address, recipient_city, recipient_state, recipient_zipcode,
               weight_kg, volume_m3, freight_value, freight_modality,
               carrier_name, delivery_deadline, delivery_date,
               latitude, longitude, geocoding_status, created_at, updated_at
        FROM shipment_records
        WHERE project_id = $1
        ORDER BY nf_date DESC NULLS LAST, created_at DESC
        LIMIT $2 OFFSET $3
        """,
        project_id,
        limit,
        skip,
    )
    return [_row_to_shipment(r) for r in rows]


@router.post("/projects/{project_id}/shipments", response_model=ShipmentRecordResponse, status_code=201)
async def create_shipment(project_id: UUID, body: ShipmentRecordCreate):
    project = await fetch_one(
        "SELECT id, organization_id FROM projects WHERE id = $1 AND deleted_at IS NULL", project_id
    )
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    lat = body.latitude
    lng = body.longitude
    geo_status = "imported" if (lat is not None and lng is not None) else "pending"

    if geo_status == "pending" and body.recipient_address:
        geo = await _geocode_single(body.recipient_address)
        if geo:
            lat = geo["latitude"]
            lng = geo["longitude"]
            geo_status = geo["source"]

    row = await fetch_one(
        """
        INSERT INTO shipment_records (
            project_id, organization_id,
            nf_number, nf_date, nf_value,
            sender_name, sender_city, sender_state,
            recipient_name, recipient_address, recipient_city, recipient_state, recipient_zipcode,
            weight_kg, volume_m3, freight_value, freight_modality,
            carrier_name, delivery_deadline, delivery_date,
            latitude, longitude, geocoding_status
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
            $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        )
        RETURNING id, project_id, organization_id, nf_number, nf_date, nf_value,
                  sender_name, sender_city, sender_state,
                  recipient_name, recipient_address, recipient_city, recipient_state, recipient_zipcode,
                  weight_kg, volume_m3, freight_value, freight_modality,
                  carrier_name, delivery_deadline, delivery_date,
                  latitude, longitude, geocoding_status, created_at, updated_at
        """,
        project_id,
        project["organization_id"],
        body.nf_number,
        body.nf_date,
        body.nf_value,
        body.sender_name,
        body.sender_city,
        body.sender_state,
        body.recipient_name,
        body.recipient_address,
        body.recipient_city,
        body.recipient_state,
        body.recipient_zipcode,
        body.weight_kg,
        body.volume_m3,
        body.freight_value,
        body.freight_modality,
        body.carrier_name,
        body.delivery_deadline,
        body.delivery_date,
        lat,
        lng,
        geo_status,
    )
    return _row_to_shipment(row)


@router.post("/projects/{project_id}/shipments/bulk", status_code=201)
async def bulk_import_shipments(project_id: UUID, records: list[ShipmentRecordCreate]):
    project = await fetch_one(
        "SELECT id, organization_id FROM projects WHERE id = $1 AND deleted_at IS NULL", project_id
    )
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    org_id = project["organization_id"]

    addresses = [
        r.recipient_address
        for r in records
        if r.recipient_address and r.latitude is None
    ]
    geo_cache: dict = {}
    if addresses:
        geo_cache = await geocode_batch(addresses)

    inserted = 0
    failed = 0
    for body in records:
        lat = body.latitude
        lng = body.longitude
        geo_status = "imported" if (lat is not None and lng is not None) else "pending"

        if geo_status == "pending" and body.recipient_address:
            geo = geo_cache.get(body.recipient_address.strip())
            if geo:
                lat = geo["latitude"]
                lng = geo["longitude"]
                geo_status = geo["source"]
            else:
                geo_status = "failed"
                failed += 1

        try:
            await execute(
                """
                INSERT INTO shipment_records (
                    project_id, organization_id,
                    nf_number, nf_date, nf_value,
                    sender_name, sender_city, sender_state,
                    recipient_name, recipient_address, recipient_city, recipient_state, recipient_zipcode,
                    weight_kg, volume_m3, freight_value, freight_modality,
                    carrier_name, delivery_deadline, delivery_date,
                    latitude, longitude, geocoding_status
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                    $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
                )
                """,
                project_id,
                org_id,
                body.nf_number,
                body.nf_date,
                body.nf_value,
                body.sender_name,
                body.sender_city,
                body.sender_state,
                body.recipient_name,
                body.recipient_address,
                body.recipient_city,
                body.recipient_state,
                body.recipient_zipcode,
                body.weight_kg,
                body.volume_m3,
                body.freight_value,
                body.freight_modality,
                body.carrier_name,
                body.delivery_deadline,
                body.delivery_date,
                lat,
                lng,
                geo_status,
            )
            inserted += 1
        except Exception:
            failed += 1

    return {"inserted": inserted, "failed": failed, "total": len(records)}


@router.get("/shipments/{shipment_id}", response_model=ShipmentRecordResponse)
async def get_shipment(shipment_id: UUID):
    row = await fetch_one(
        """
        SELECT id, project_id, organization_id, nf_number, nf_date, nf_value,
               sender_name, sender_city, sender_state,
               recipient_name, recipient_address, recipient_city, recipient_state, recipient_zipcode,
               weight_kg, volume_m3, freight_value, freight_modality,
               carrier_name, delivery_deadline, delivery_date,
               latitude, longitude, geocoding_status, created_at, updated_at
        FROM shipment_records
        WHERE id = $1
        """,
        shipment_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    return _row_to_shipment(row)


async def _geocode_single(address: str) -> dict | None:
    from app.services.geocoding_service import geocode_address
    return await geocode_address(address)
