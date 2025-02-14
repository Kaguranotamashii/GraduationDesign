import React, { useState } from 'react';
import {
    MessageSquare,
    ThumbsUp,
    Reply,
    MoreHorizontal,
    Heart,
    Clock,
    ChevronDown,
    ChevronUp,
    Send
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// 模拟评论数据
const MOCK_COMMENTS = [
    {
        id: 1,
        author: {
            name: "张三",
            avatar: "/avatars/avatar-1.jpg",
            badge: "作者"
        },
        content: "这篇文章写得非常详细，对我理解系统架构很有帮助。特别是关于微服务部分的讲解，让我对分布式系统有了更深的认识。",
        timestamp: "2024-02-14 10:30",
        likes: 45,
        isLiked: false,
        replies: [
            {
                id: 2,
                author: {
                    name: "李四",
                    avatar: "/avatars/avatar-2.jpg",
                    badge: "高级开发"
                },
                content: "赞同楼主的观点！想请教一下微服务架构中服务发现的具体实现方案，你们是用的什么技术栈？",
                timestamp: "2024-02-14 11:15",
                likes: 12,
                isLiked: false,
                replies: [
                    {
                        id: 3,
                        author: {
                            name: "张三",
                            avatar: "/avatars/avatar-1.jpg",
                            badge: "作者"
                        },
                        content: "我们主要使用的是 Spring Cloud Netflix 套件，服务发现用的是 Eureka。不过最近在考虑迁移到 Consul，主要是看中了它的服务网格特性。",
                        timestamp: "2024-02-14 11:30",
                        likes: 8,
                        isLiked: false,
                    }
                ]
            }
        ]
    },
    {
        id: 4,
        author: {
            name: "王五",
            avatar: "/avatars/avatar-3.jpg",
            badge: "架构师"
        },
        content: "文章中提到的性能优化方案非常实用。我在实际项目中也遇到类似的问题，通过实现读写分离和引入缓存层确实能显著提升系统性能。建议可以再补充一下分布式缓存的选型考虑因素。",
        timestamp: "2024-02-14 14:20",
        likes: 32,
        isLiked: false,
        replies: []
    },
    {
        id: 5,
        author: {
            name: "赵六",
            avatar: "/avatars/avatar-4.jpg",
        },
        content: "文章的整体框架很清晰，但是在谈到分布式事务时，感觉对 SAGA 模式的讲解可以再深入一些，尤其是补偿事务的具体实现。",
        timestamp: "2024-02-14 15:45",
        likes: 18,
        isLiked: false,
        replies: [
            {
                id: 6,
                author: {
                    name: "张三",
                    avatar: "/avatars/avatar-1.jpg",
                    badge: "作者"
                },
                content: "感谢建议！确实这部分内容可以展开，我会在下一篇文章中专门讨论 SAGA 模式，包括补偿事务的最佳实践和实际案例分析。",
                timestamp: "2024-02-14 16:00",
                likes: 15,
                isLiked: false,
            }
        ]
    }
];

const Comment = ({ comment, depth = 0, onReply }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [isLiked, setIsLiked] = useState(comment.isLiked);
    const [likesCount, setLikesCount] = useState(comment.likes);
    const [showReplies, setShowReplies] = useState(depth < 1);
    const [replyContent, setReplyContent] = useState('');

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handleReplySubmit = () => {
        if (replyContent.trim()) {
            onReply(comment.id, replyContent);
            setReplyContent('');
            setShowReplyInput(false);
        }
    };

    return (
        <div className="group">
            <div className="flex gap-4">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                                {comment.author.name}
                            </span>
                            {comment.author.badge && (
                                <Badge variant="outline" className="text-xs">
                                    {comment.author.badge}
                                </Badge>
                            )}
                        </div>
                        <p className="text-gray-700 text-base leading-relaxed">
                            {comment.content}
                        </p>
                    </div>

                    <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{comment.timestamp}</span>
                        </div>
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 hover:text-blue-600 transition-colors ${
                                isLiked ? 'text-blue-600' : ''
                            }`}
                        >
                            {isLiked ? (
                                <Heart className="w-4 h-4 fill-current" />
                            ) : (
                                <Heart className="w-4 h-4" />
                            )}
                            <span>{likesCount}</span>
                        </button>
                        <button
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                        >
                            <Reply className="w-4 h-4" />
                            <span>回复</span>
                        </button>
                    </div>

                    {showReplyInput && (
                        <div className="mt-4 space-y-4">
                            <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={`回复 ${comment.author.name}...`}
                                className="min-h-[100px]"
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowReplyInput(false)}
                                >
                                    取消
                                </Button>
                                <Button
                                    onClick={handleReplySubmit}
                                    className="gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    发送回复
                                </Button>
                            </div>
                        </div>
                    )}

                    {comment.replies?.length > 0 && (
                        <div className="mt-4">
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                {showReplies ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                                <span>{showReplies ? '收起回复' : `显示 ${comment.replies.length} 条回复`}</span>
                            </button>
                            {showReplies && (
                                <div className="ml-6 mt-4 space-y-4 border-l-2 border-gray-100 pl-4">
                                    {comment.replies.map(reply => (
                                        <Comment
                                            key={reply.id}
                                            comment={reply}
                                            depth={depth + 1}
                                            onReply={onReply}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CommentSection = () => {
    const [comments, setComments] = useState(MOCK_COMMENTS);
    const [newComment, setNewComment] = useState('');

    const handleAddComment = () => {
        if (newComment.trim()) {
            const newCommentObj = {
                id: Date.now(),
                author: {
                    name: "当前用户",
                    avatar: "/avatars/avatar-5.jpg",
                },
                content: newComment,
                timestamp: new Date().toLocaleString(),
                likes: 0,
                isLiked: false,
                replies: []
            };
            setComments([newCommentObj, ...comments]);
            setNewComment('');
        }
    };

    const handleReply = (commentId, content) => {
        const newReply = {
            id: Date.now(),
            author: {
                name: "当前用户",
                avatar: "/avatars/avatar-5.jpg",
            },
            content: content,
            timestamp: new Date().toLocaleString(),
            likes: 0,
            isLiked: false,
        };

        const addReplyToComment = (comments) => {
            return comments.map(comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        replies: [...(comment.replies || []), newReply]
                    };
                }
                if (comment.replies) {
                    return {
                        ...comment,
                        replies: addReplyToComment(comment.replies)
                    };
                }
                return comment;
            });
        };

        setComments(addReplyToComment(comments));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    评论区
                    <Badge variant="secondary" className="ml-2">
                        {comments.length}
                    </Badge>
                </h3>
            </div>

            <div className="p-6">
                {/* 评论输入框 */}
                <div className="mb-8 space-y-4">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="写下你的评论..."
                        className="min-h-[120px]"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleAddComment}
                            className="gap-2"
                        >
                            <Send className="w-4 h-4" />
                            发表评论
                        </Button>
                    </div>
                </div>

                {/* 评论列表 */}
                <div className="space-y-6">
                    {comments.map(comment => (
                        <Comment
                            key={comment.id}
                            comment={comment}
                            onReply={handleReply}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommentSection;