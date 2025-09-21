"""add_ai_feedback_column

Revision ID: 8ec8a33c7c34
Revises: 01ed087c01ed
Create Date: 2025-09-18 07:18:xx.xxxxxx

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '8ec8a33c7c34'
down_revision = '01ed087c01ed'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        ALTER TABLE challenges
        ADD COLUMN IF NOT EXISTS ai_feedback TEXT
    """)

def downgrade():
    op.execute("""
        ALTER TABLE challenges
        DROP COLUMN IF EXISTS ai_feedback
    """)