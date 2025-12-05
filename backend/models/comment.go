package models

import (
	"time"
)

type Comment struct {
	ID        string    `json:"id" db:"id"`
	ArticleID string    `json:"article_id" db:"article_id"`
	UserID    string    `json:"user_id" db:"user_id"`
	ParentID  *string   `json:"parent_id,omitempty" db:"parent_id"` // For nested replies
	Content   string    `json:"content" db:"content"`
	Author    *User     `json:"author,omitempty"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Replies   []Comment `json:"replies,omitempty"`
}

type CommentCreateRequest struct {
	ArticleID string  `json:"article_id"`
	ParentID  *string `json:"parent_id,omitempty"`
	Content   string  `json:"content"`
}

type CommentUpdateRequest struct {
	Content string `json:"content"`
}

type CommentListResponse struct {
	Comments   []Comment `json:"comments"`
	Total      int       `json:"total"`
	Page       int       `json:"page"`
	PageSize   int       `json:"page_size"`
	TotalPages int       `json:"total_pages"`
}
