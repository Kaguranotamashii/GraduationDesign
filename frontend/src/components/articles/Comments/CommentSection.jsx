import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Reply,
    Heart,
    Clock,
    ChevronDown,
    ChevronUp,
    Send,
    Smile,
    Trash2,
    Pin
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { message } from 'antd';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {
    getComments,
    addComment,
    likeComment,
    unlikeComment,
    replyToComment,
    deleteComment
} from '@/api/commentApi';
import { getUserInfo } from '@/api/userApi';
import { format } from 'date-fns';
import { useDispatch } from "react-redux";
import { getToken } from "@/store/authSlice";

const Comment = ({
                     comment,
                     depth = 0,
                     onReply,
                     articleId,
                     articleAuthorId,
                     onCommentUpdate,
                     replies = []
                 }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [showReplies, setShowReplies] = useState(depth < 1);
    const [replyContent, setReplyContent] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAuthAndGetUser = async () => {
            const token = getToken();
            if (!token) {
                setCurrentUser(null);
                return;
            }

            try {
                const response = await getUserInfo();
                if (response.code === 200) {
                    setCurrentUser(response.data);
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
                setCurrentUser(null);
            }
        };

        checkAuthAndGetUser();
    }, []);

    const canDelete = currentUser && (
        currentUser.id === comment.author ||
        currentUser.id === articleAuthorId ||
        currentUser.is_staff
    );

    useEffect(() => {
        if (comment) {
            setIsLiked(comment.is_liked);
            setLikesCount(comment.likes);
        }
    }, [comment]);

    const handleLike = async () => {
        if (!comment?.id) return;

        try {
            const response = await (isLiked ? unlikeComment : likeComment)(comment.id);
            if (response.code === 200 || response.code === 201) {
                const { is_liked, likes } = response.data;
                setIsLiked(is_liked);
                setLikesCount(likes);
                message.success(isLiked ? '取消点赞成功' : '点赞成功');
                if (onCommentUpdate) {
                    onCommentUpdate();
                }
            } else {
                throw new Error(response.message || '操作失败');
            }
        } catch (error) {
            console.error('点赞操作失败:', error);
            message.error(isLiked ? '取消点赞失败' : '点赞失败');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await deleteComment(comment.id);
            if (response.code === 200) {
                message.success('评论删除成功');
                if (onCommentUpdate) {
                    onCommentUpdate();
                }
            } else {
                throw new Error(response.message || '删除失败');
            }
        } catch (error) {
            console.error('删除评论失败:', error);
            message.error('删除评论失败: ' + (error.message || '未知错误'));
        }
    };

    const handleReplySubmit = async () => {
        if (!replyContent.trim() || !comment?.id || !articleId) return;

        try {
            const response = await replyToComment(articleId, comment.id, replyContent);
            if (response.code === 201) {
                message.success('回复成功');
                setReplyContent('');
                setShowReplyInput(false);
                if (onCommentUpdate) {
                    onCommentUpdate();
                }
            } else {
                throw new Error(response.message || '回复失败');
            }
        } catch (error) {
            console.error('回复失败:', error);
            message.error('回复失败: ' + (error.message || '未知错误'));
        }
    };

    if (!comment) return null;

    const commentReplies = replies.filter(reply => reply.parent === comment.id);

    return (
        <div className={`group relative ${comment.is_top ? 'bg-blue-50/50 rounded-lg p-4 mb-4' : ''}`}>
            {comment.is_top && (
                <div className="absolute -left-2 top-0">
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Pin className="w-3 h-3" />
                        置顶
                    </Badge>
                </div>
            )}
            <div className="flex gap-4">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={comment.author_avatar} alt={comment.author_name} />
                    <AvatarFallback>{comment.author_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                                {comment.author_name || '匿名用户'}
                            </span>
                            {comment.author_badge && (
                                <Badge variant="outline" className="text-xs">
                                    {comment.author_badge}
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
                            <span>{format(new Date(comment.created_at), 'yyyy-MM-dd HH:mm')}</span>
                        </div>
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 hover:text-blue-600 transition-colors ${
                                isLiked ? 'text-blue-600' : ''
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                            <span>{likesCount}</span>
                        </button>
                        <button
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                        >
                            <Reply className="w-4 h-4" />
                            <span>回复</span>
                        </button>
                        {canDelete && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="flex items-center gap-1.5 hover:text-red-600 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                        <span>删除</span>
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>确认删除评论？</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {commentReplies.length > 0
                                                ? '此操作将同时删除该评论下的所有回复，且不可恢复。'
                                                : '此操作不可恢复。'
                                            }
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>取消</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            确认删除
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>

                    {showReplyInput && (
                        <div className="mt-4 space-y-4">
                            <div className="relative">
                                <Textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={`回复 ${comment.author_name || '匿名用户'}...`}
                                    className="min-h-[100px]"
                                    maxLength={500}
                                />
                                <div className="absolute bottom-2 right-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                            >
                                                <Smile className="h-5 w-5" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-full p-0"
                                            align="end"
                                        >
                                            <Picker
                                                data={data}
                                                onEmojiSelect={(emoji) => {
                                                    setReplyContent(prev => prev + emoji.native)
                                                }}
                                                theme="light"
                                                set="native"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowReplyInput(false);
                                        setReplyContent('');
                                    }}
                                >
                                    取消
                                </Button>
                                <Button
                                    onClick={handleReplySubmit}
                                    disabled={!replyContent.trim()}
                                    className="gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    发送回复
                                </Button>
                            </div>
                        </div>
                    )}

                    {commentReplies.length > 0 && (
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
                                <span>
                                    {showReplies ? '收起回复' : `显示 ${commentReplies.length} 条回复`}
                                </span>
                            </button>
                            {showReplies && (
                                <div className="ml-6 mt-4 space-y-4 border-l-2 border-gray-100 pl-4">
                                    {commentReplies.map(reply => (
                                        <Comment
                                            key={reply.id}
                                            comment={reply}
                                            depth={depth + 1}
                                            onReply={onReply}
                                            articleId={articleId}
                                            articleAuthorId={articleAuthorId}
                                            onCommentUpdate={onCommentUpdate}
                                            replies={replies}
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

const CommentSection = ({ articleId, articleAuthorId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);

    // 按置顶和时间排序评论
    const sortComments = (commentsToSort) => {
        return [...commentsToSort].sort((a, b) => {
            // 首先按置顶状态排序
            if (a.is_top && !b.is_top) return -1;
            if (!a.is_top && b.is_top) return 1;

            // 如果置顶状态相同，则按时间倒序排序
            return new Date(b.created_at) - new Date(a.created_at);
        });
    };

    const fetchComments = async (pageNum = 1) => {
        if (!articleId) return;

        try {
            setLoading(true);
            const response = await getComments(articleId, { page: pageNum });

            if (response.code === 200 || response.code === 201) {
                const newComments = response.data || [];
                if (pageNum === 1) {
                    setComments(sortComments(newComments));
                } else {
                    setComments(prev => sortComments([...prev, ...newComments]));
                }
                setHasMore(false);
                setTotal(newComments.length);
                setPage(pageNum);
            } else
            {
                throw new Error(response.message || '获取评论失败');
            }
        } catch (error) {
            console.error('获取评论失败:', error);
            message.error('获取评论失败: ' + (error.message || '未知错误'));
            setComments([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (articleId) {
            fetchComments(1);
        }
    }, [articleId]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !articleId) return;

        try {
            const response = await addComment({
                article: articleId,
                content: newComment.trim()
            });

            if (response.code === 200 || response.code === 201) {
                message.success('评论发表成功');
                setNewComment('');
                await fetchComments(1);
            } else {
                throw new Error(response.message || '评论发表失败');
            }
        } catch (error) {
            console.error('评论发表失败:', error);
            message.error('评论发表失败: ' + (error.message || '未知错误'));
        }
    };

    // 过滤出顶层评论
    const topLevelComments = sortComments(
        comments.filter(comment => !comment.parent)
    );

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    评论区
                    <Badge variant="secondary" className="ml-2">
                        {total}
                    </Badge>
                </h3>
            </div>

            <div className="p-6">
                <div className="mb-8 space-y-4">
                    <div className="relative">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="写下你的评论..."
                            className="min-h-[120px]"
                            maxLength={500}
                        />
                        <div className="absolute bottom-2 right-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                    >
                                        <Smile className="h-5 w-5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-full p-0"
                                    align="end"
                                >
                                    <Picker
                                        data={data}
                                        onEmojiSelect={(emoji) => {
                                            setNewComment(prev => prev + emoji.native)
                                        }}
                                        theme="light"
                                        set="native"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                            {newComment.length}/500
                        </span>
                        <Button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="gap-2"
                        >
                            <Send className="w-4 h-4" />
                            发表评论
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    {loading && comments.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">加载评论中...</div>
                    ) : topLevelComments.length > 0 ? (
                        topLevelComments.map(comment => (
                            <Comment
                                key={comment.id}
                                comment={comment}
                                articleId={articleId}
                                articleAuthorId={articleAuthorId}
                                onCommentUpdate={() => fetchComments(1)}
                                replies={comments}
                            />
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            暂无评论，快来发表第一条评论吧！
                        </div>
                    )}

                    {hasMore && comments.length > 0 && (
                        <div className="text-center">
                            <Button
                                variant="outline"
                                onClick={() => fetchComments(page + 1)}
                                disabled={loading}
                            >
                                {loading ? '加载中...' : '加载更多'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentSection;