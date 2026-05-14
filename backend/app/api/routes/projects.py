from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.models.schemas import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.database import execute, fetch_all, fetch_one

router = APIRouter()


def _row_to_project(row) -> dict:
    return dict(row)


@router.get("/projects", response_model=list[ProjectResponse])
async def list_projects(organization_id: UUID, client_id: UUID | None = None, skip: int = 0, limit: int = 100):
    if client_id:
        rows = await fetch_all(
            """
            SELECT p.id, p.client_id, c.name AS client_name, p.organization_id,
                   p.name, p.description, p.status, p.started_at, p.finished_at,
                   p.created_at, p.updated_at
            FROM projects p
            JOIN clients c ON c.id = p.client_id
            WHERE p.organization_id = $1 AND p.client_id = $2 AND p.deleted_at IS NULL
            ORDER BY p.name
            LIMIT $3 OFFSET $4
            """,
            organization_id,
            client_id,
            limit,
            skip,
        )
    else:
        rows = await fetch_all(
            """
            SELECT p.id, p.client_id, c.name AS client_name, p.organization_id,
                   p.name, p.description, p.status, p.started_at, p.finished_at,
                   p.created_at, p.updated_at
            FROM projects p
            JOIN clients c ON c.id = p.client_id
            WHERE p.organization_id = $1 AND p.deleted_at IS NULL
            ORDER BY p.name
            LIMIT $2 OFFSET $3
            """,
            organization_id,
            limit,
            skip,
        )
    return [_row_to_project(r) for r in rows]


@router.post("/projects", response_model=ProjectResponse, status_code=201)
async def create_project(body: ProjectCreate):
    client = await fetch_one(
        "SELECT id FROM clients WHERE id = $1 AND deleted_at IS NULL", body.client_id
    )
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    row = await fetch_one(
        """
        INSERT INTO projects (client_id, organization_id, name, description, status, started_at, finished_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, client_id, organization_id, name, description, status,
                  started_at, finished_at, created_at, updated_at
        """,
        body.client_id,
        body.organization_id,
        body.name,
        body.description,
        body.status,
        body.started_at,
        body.finished_at,
    )
    result = _row_to_project(row)
    client_row = await fetch_one("SELECT name FROM clients WHERE id = $1", body.client_id)
    result["client_name"] = client_row["name"] if client_row else None
    return result


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: UUID):
    row = await fetch_one(
        """
        SELECT p.id, p.client_id, c.name AS client_name, p.organization_id,
               p.name, p.description, p.status, p.started_at, p.finished_at,
               p.created_at, p.updated_at
        FROM projects p
        JOIN clients c ON c.id = p.client_id
        WHERE p.id = $1 AND p.deleted_at IS NULL
        """,
        project_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return _row_to_project(row)


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: UUID, body: ProjectUpdate):
    existing = await fetch_one(
        "SELECT id FROM projects WHERE id = $1 AND deleted_at IS NULL", project_id
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    fields = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(updates))
    values = list(updates.values())

    await execute(
        f"UPDATE projects SET {fields} WHERE id = $1 AND deleted_at IS NULL",
        project_id,
        *values,
    )
    return await get_project(project_id)


@router.delete("/projects/{project_id}", status_code=204)
async def delete_project(project_id: UUID):
    result = await execute(
        "UPDATE projects SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
        project_id,
    )
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
