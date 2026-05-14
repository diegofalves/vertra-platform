from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.models.schemas import ClientCreate, ClientResponse, ClientUpdate
from app.services.database import execute, fetch_all, fetch_one

router = APIRouter()


def _row_to_client(row) -> dict:
    return dict(row)


@router.get("/clients", response_model=list[ClientResponse])
async def list_clients(organization_id: UUID, skip: int = 0, limit: int = 100):
    rows = await fetch_all(
        """
        SELECT id, organization_id, name, cnpj, email, phone, city, state,
               active, created_at, updated_at
        FROM clients
        WHERE organization_id = $1 AND deleted_at IS NULL
        ORDER BY name
        LIMIT $2 OFFSET $3
        """,
        organization_id,
        limit,
        skip,
    )
    return [_row_to_client(r) for r in rows]


@router.post("/clients", response_model=ClientResponse, status_code=201)
async def create_client(body: ClientCreate):
    row = await fetch_one(
        """
        INSERT INTO clients (organization_id, name, cnpj, email, phone, city, state)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, organization_id, name, cnpj, email, phone, city, state,
                  active, created_at, updated_at
        """,
        body.organization_id,
        body.name,
        body.cnpj,
        body.email,
        body.phone,
        body.city,
        body.state,
    )
    return _row_to_client(row)


@router.get("/clients/{client_id}", response_model=ClientResponse)
async def get_client(client_id: UUID):
    row = await fetch_one(
        """
        SELECT id, organization_id, name, cnpj, email, phone, city, state,
               active, created_at, updated_at
        FROM clients
        WHERE id = $1 AND deleted_at IS NULL
        """,
        client_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return _row_to_client(row)


@router.put("/clients/{client_id}", response_model=ClientResponse)
async def update_client(client_id: UUID, body: ClientUpdate):
    existing = await fetch_one(
        "SELECT id FROM clients WHERE id = $1 AND deleted_at IS NULL", client_id
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    fields = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(updates))
    values = list(updates.values())

    row = await fetch_one(
        f"""
        UPDATE clients SET {fields}
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id, organization_id, name, cnpj, email, phone, city, state,
                  active, created_at, updated_at
        """,
        client_id,
        *values,
    )
    return _row_to_client(row)


@router.delete("/clients/{client_id}", status_code=204)
async def delete_client(client_id: UUID):
    result = await execute(
        "UPDATE clients SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
        client_id,
    )
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
