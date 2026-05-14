from __future__ import annotations
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Geocoding
# ---------------------------------------------------------------------------

class GeocodeRequest(BaseModel):
    address: str = Field(..., min_length=1, description="Endereço em texto livre")


class GeocodeResponse(BaseModel):
    latitude: float
    longitude: float
    formatted_address: str
    source: str = "api"


class BulkGeocodeRequest(BaseModel):
    addresses: list[str] = Field(..., min_length=1)


class BulkGeocodeResponse(BaseModel):
    results: dict[str, Optional[GeocodeResponse]]


# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------

class ClientCreate(BaseModel):
    organization_id: UUID
    name: str = Field(..., min_length=1, max_length=255)
    cnpj: Optional[str] = Field(None, max_length=18)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=2)


class ClientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    cnpj: Optional[str] = Field(None, max_length=18)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=2)
    active: Optional[bool] = None


class ClientResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    cnpj: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    city: Optional[str]
    state: Optional[str]
    active: bool
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------

class ProjectCreate(BaseModel):
    client_id: UUID
    organization_id: UUID
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = Field("active", pattern="^(active|paused|completed)$")
    started_at: Optional[date] = None
    finished_at: Optional[date] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|paused|completed)$")
    started_at: Optional[date] = None
    finished_at: Optional[date] = None


class ProjectResponse(BaseModel):
    id: UUID
    client_id: UUID
    client_name: Optional[str] = None
    organization_id: UUID
    name: str
    description: Optional[str]
    status: str
    started_at: Optional[date]
    finished_at: Optional[date]
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Shipment Records
# ---------------------------------------------------------------------------

class ShipmentRecordCreate(BaseModel):
    nf_number: Optional[str] = Field(None, max_length=50)
    nf_date: Optional[date] = None
    nf_value: Optional[Decimal] = None
    sender_name: Optional[str] = Field(None, max_length=255)
    sender_city: Optional[str] = Field(None, max_length=100)
    sender_state: Optional[str] = Field(None, max_length=2)
    recipient_name: Optional[str] = Field(None, max_length=255)
    recipient_address: Optional[str] = None
    recipient_city: Optional[str] = Field(None, max_length=100)
    recipient_state: Optional[str] = Field(None, max_length=2)
    recipient_zipcode: Optional[str] = Field(None, max_length=9)
    weight_kg: Optional[Decimal] = None
    volume_m3: Optional[Decimal] = None
    freight_value: Optional[Decimal] = None
    freight_modality: Optional[str] = Field(None, pattern="^(lotacao|fracionado_peso|fracionado_valor)$")
    carrier_name: Optional[str] = Field(None, max_length=255)
    delivery_deadline: Optional[int] = None
    delivery_date: Optional[date] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None


class ShipmentRecordResponse(BaseModel):
    id: UUID
    project_id: UUID
    organization_id: UUID
    nf_number: Optional[str]
    nf_date: Optional[date]
    nf_value: Optional[Decimal]
    sender_name: Optional[str]
    sender_city: Optional[str]
    sender_state: Optional[str]
    recipient_name: Optional[str]
    recipient_address: Optional[str]
    recipient_city: Optional[str]
    recipient_state: Optional[str]
    recipient_zipcode: Optional[str]
    weight_kg: Optional[Decimal]
    volume_m3: Optional[Decimal]
    freight_value: Optional[Decimal]
    freight_modality: Optional[str]
    carrier_name: Optional[str]
    delivery_deadline: Optional[int]
    delivery_date: Optional[date]
    latitude: Optional[Decimal]
    longitude: Optional[Decimal]
    geocoding_status: str
    created_at: datetime
    updated_at: datetime
