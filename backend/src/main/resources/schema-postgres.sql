-- ====================================================================
-- TimeFlow PostgreSQL Schema
-- Clean, production-ready schema definition for PostgreSQL 14+
-- ====================================================================

-- Drop existing tables if needed
DROP TABLE IF EXISTS tasks CASCADE;

-- Create Tasks table
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    task_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Channel specific fields: WhatsApp
    recipient VARCHAR(100),
    message_body TEXT,
    
    -- Channel specific fields: Calendar
    event_description TEXT,
    event_start_time TIMESTAMP WITH TIME ZONE,
    event_end_time TIMESTAMP WITH TIME ZONE,
    reminder_offset_minutes INTEGER DEFAULT 15,
    ics_content TEXT,
    google_calendar_link VARCHAR(500),
    
    -- Channel specific fields: Alarm
    ring_tone VARCHAR(50) DEFAULT 'CHIME',
    
    -- Meta & Dispatch Tracking
    is_quiet_hours BOOLEAN DEFAULT FALSE,
    dispatched_at TIMESTAMP WITH TIME ZONE,
    dispatch_result TEXT,
    repeat_frequency VARCHAR(50) DEFAULT 'ONCE',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_tasks_status_scheduled ON tasks(task_status, scheduled_time);
CREATE INDEX idx_tasks_type ON tasks(task_type);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Comment documentation
COMMENT ON TABLE tasks IS 'Stores scheduled tasks across WhatsApp, Google Calendar, and Audible Alarms';
COMMENT ON COLUMN tasks.task_type IS 'WHATSAPP, CALENDAR, ALARM';
COMMENT ON COLUMN tasks.task_status IS 'PENDING, RUNNING, SENT, FAILED, SNOOZED, DISMISSED';
COMMENT ON COLUMN tasks.ring_tone IS 'CHIME, BEEP, GENTLE';
