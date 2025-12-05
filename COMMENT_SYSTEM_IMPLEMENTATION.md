# 💬 评论系统实现文档

## 📋 概述

本文档详细说明了Aether Blog评论系统的完整实现，包括后端API、前端组件和数据库设计。

## 🏗️ 架构设计

### 系统架构
```
┌─────────────────┐
│   前端 (React)   │
│  CommentSection │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│  后端 (Go)      │
│  Comment API    │
└────────┬────────┘
         │ SQL
         ↓
┌─────────────────┐
│ PostgreSQL DB   │
│  comments表     │
└─────────────────┘
```

## 🗄️ 数据库设计

### comments表结构
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引优化
CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
```

### 数据模型特点
- **嵌套回复**: 通过`parent_id`实现无限层级回复
- **级联删除**: 删除文章/用户时自动删除相关评论
- **时间戳**: 自动记录创建和更新时间
- **UUID主键**: 使用UUID确保全局唯一性

## 🔧 后端实现

### 1. 数据模型 (`backend/models/comment.go`)

```go
type Comment struct {
    ID        string    `json:"id"`
    ArticleID string    `json:"article_id"`
    UserID    string    `json:"user_id"`
    ParentID  *string   `json:"parent_id,omitempty"`
    Content   string    `json:"content"`
    Author    *User     `json:"author,omitempty"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
    Replies   []Comment `json:"replies,omitempty"`
}
```

### 2. 服务层 (`backend/services/comment_service.go`)

#### 核心功能
- ✅ `CreateComment()` - 创建评论
- ✅ `GetCommentsByArticle()` - 获取文章评论（分页）
- ✅ `GetReplies()` - 获取回复
- ✅ `DeleteComment()` - 删除评论（权限验证）

#### 特性
- 自动加载作者信息（JOIN users表）
- 递归加载嵌套回复
- 分页支持（默认20条/页）
- 权限验证（只能删除自己的评论或管理员）

### 3. 处理器层 (`backend/handlers/comment.go`)

#### API端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/articles/{articleId}/comments` | 获取文章评论 | 否 |
| POST | `/api/comments` | 创建评论 | 是 |
| DELETE | `/api/comments/{id}` | 删除评论 | 是 |

#### 请求示例

**创建评论**
```bash
POST /api/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "article_id": "uuid",
  "content": "这是一条评论",
  "parent_id": null  // 可选，回复时填写父评论ID
}
```

**获取评论**
```bash
GET /api/articles/{articleId}/comments?page=1&limit=20
```

**删除评论**
```bash
DELETE /api/comments/{commentId}
Authorization: Bearer {token}
```

## 🎨 前端实现

### 组件结构 (`aether-blog/components/CommentSection.tsx`)

```
CommentSection
├── 评论表单 (新评论)
├── 评论列表
│   └── CommentItem (递归组件)
│       ├── 评论内容
│       ├── 作者信息
│       ├── 操作按钮 (回复/编辑/删除)
│       ├── 回复表单 (条件渲染)
│       └── 回复列表 (递归)
```

### 核心功能

#### 1. 评论显示
- ✅ 评论列表展示
- ✅ 作者头像和名称
- ✅ 相对时间显示（"Just now", "2h ago"）
- ✅ 管理员标识
- ✅ 嵌套回复缩进显示

#### 2. 评论交互
- ✅ 发表新评论
- ✅ 回复评论
- ✅ 编辑自己的评论
- ✅ 删除自己的评论
- ✅ 管理员可删除任何评论
- ✅ 字符数限制（1000字符）

#### 3. 状态管理
```typescript
const [comments, setComments] = useState<Comment[]>([]);
const [loading, setLoading] = useState(true);
const [newComment, setNewComment] = useState('');
const [replyTo, setReplyTo] = useState<string | null>(null);
const [editingComment, setEditingComment] = useState<string | null>(null);
```

#### 4. API集成
```typescript
// 加载评论
const loadComments = async () => {
  const response = await apiClient.get(`/articles/${articleId}/comments`);
  setComments(response.data.comments || []);
};

// 提交评论
const handleSubmitComment = async (e: React.FormEvent) => {
  await apiClient.post('/comments', {
    article_id: articleId,
    content: newComment.trim()
  });
  await loadComments();
};
```

## 🎯 功能特性

### 已实现功能
- ✅ 评论CRUD操作
- ✅ 无限层级嵌套回复
- ✅ 实时更新
- ✅ 权限控制
- ✅ 响应式设计
- ✅ 加载状态
- ✅ 错误处理
- ✅ 字符数限制
- ✅ 时间格式化

### 安全特性
- ✅ JWT认证
- ✅ 权限验证（只能编辑/删除自己的评论）
- ✅ 管理员特权
- ✅ SQL注入防护（参数化查询）
- ✅ XSS防护（内容转义）

## 📊 性能优化

### 数据库优化
- ✅ 索引优化（article_id, user_id, parent_id）
- ✅ 分页查询
- ✅ JOIN优化（一次查询获取作者信息）

### 前端优化
- ✅ 条件渲染（减少DOM节点）
- ✅ 防抖处理（提交按钮）
- ✅ 乐观更新（立即显示新评论）

## 🧪 测试指南

### 手动测试清单
- [ ] 未登录状态显示登录提示
- [ ] 登录后可以发表评论
- [ ] 评论立即显示在列表中
- [ ] 可以回复评论
- [ ] 回复正确嵌套显示
- [ ] 可以编辑自己的评论
- [ ] 可以删除自己的评论
- [ ] 管理员可以删除任何评论
- [ ] 字符数限制生效
- [ ] 时间显示正确

### API测试
参见 `TESTING.md` 文件中的详细测试步骤。

## 🚀 部署说明

### 数据库迁移
```bash
# 后端启动时自动运行迁移
cd backend
go run main.go
```

### 环境变量
确保以下环境变量已配置：
```env
DATABASE_URL=postgresql://user:password@localhost:5432/aether_blog
JWT_SECRET=your-secret-key
PORT=8080
```

## 📝 使用示例

### 在文章页面中使用
```tsx
import { CommentSection } from '../components/CommentSection';

export const Article = () => {
  const { id } = useParams();
  
  return (
    <Layout>
      {/* 文章内容 */}
      <div className="article-content">
        {/* ... */}
      </div>
      
      {/* 评论区 */}
      <CommentSection articleId={id || ''} />
    </Layout>
  );
};
```

## 🔮 未来改进

### 计划功能
- [ ] 评论点赞
- [ ] 评论举报
- [ ] 评论审核（管理员）
- [ ] 评论通知
- [ ] Markdown支持
- [ ] 表情符号
- [ ] @提及用户
- [ ] 评论搜索
- [ ] 评论排序（最新/最热）

### 性能优化
- [ ] 虚拟滚动（大量评论）
- [ ] 懒加载回复
- [ ] 缓存策略
- [ ] WebSocket实时更新

## 📚 相关文档

- [API文档](./API_DOCUMENTATION.md)
- [测试指南](./TESTING.md)
- [开发进度](./PROGRESS.md)

## 🤝 贡献指南

如需改进评论系统，请：
1. Fork项目
2. 创建功能分支
3. 提交Pull Request
4. 等待代码审查

---

**文档版本**: v1.0  
**最后更新**: 2025-12-05  
**作者**: Aether Blog Team
