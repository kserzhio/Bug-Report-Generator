"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type NewsComment = {
  id: string;
  parentId: string | null;
  nickname: string;
  content: string;
  createdAt: string;
};

export function NewsCommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const topLevelComments = comments.filter((comment) => !comment.parentId);
  const repliesByParentId = comments.reduce<Record<string, NewsComment[]>>((acc, comment) => {
    if (!comment.parentId) {
      return acc;
    }

    if (!acc[comment.parentId]) {
      acc[comment.parentId] = [];
    }

    acc[comment.parentId].push(comment);
    return acc;
  }, {});

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/news-comments?postId=${encodeURIComponent(postId)}`, {
          method: "GET",
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Could not load comments.");
        }

        const data = (await response.json()) as { comments: NewsComment[] };

        if (!cancelled) {
          setComments(data.comments ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : "Could not load comments.";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadComments();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownLeft(0);
      return;
    }

    const timer = setInterval(() => {
      const seconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownLeft(seconds);

      if (seconds === 0) {
        setCooldownUntil(null);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [cooldownUntil]);

  async function submitComment(input: { parentId: string | null; contentValue: string }) {
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/news-comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          postId,
          parentId: input.parentId,
          nickname,
          content: input.contentValue,
          website
        })
      });

      const data = (await response.json()) as {
        error?: string;
        accepted?: boolean;
        comment?: NewsComment;
      };

      if (data.accepted) {
        setNotice("Comment submitted.");
        setContent("");
        setReplyContent("");
        setReplyToId(null);
        return;
      }

      if (!response.ok || !data.comment) {
        throw new Error(data.error ?? "Could not post comment.");
      }

      const createdComment = data.comment;
      setComments((prev) => [...prev, createdComment]);
      setCooldownUntil(Date.now() + 15000);
      setWebsite("");

      if (input.parentId) {
        setReplyContent("");
        setReplyToId(null);
      } else {
        setContent("");
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Could not post comment.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitComment({ parentId: null, contentValue: content });
  }

  async function onReplySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!replyToId) {
      return;
    }

    await submitComment({ parentId: replyToId, contentValue: replyContent });
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="comment-nickname">Nickname</Label>
            <Input
              id="comment-nickname"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="Your name"
              maxLength={40}
            />
          </div>
          <input
            type="text"
            name="website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <Label htmlFor="comment-content">Comment</Label>
            <Textarea
              id="comment-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Share your thoughts or QA tips..."
              maxLength={2000}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}
          <Button type="submit" disabled={submitting || cooldownLeft > 0}>
            {submitting ? "Posting..." : cooldownLeft > 0 ? `Please wait ${cooldownLeft}s` : "Post comment"}
          </Button>
        </form>

        <div className="space-y-4">
          {loading ? <p className="text-sm text-muted-foreground">Loading comments...</p> : null}
          {!loading && topLevelComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment.</p>
          ) : null}
          {topLevelComments.map((comment) => (
            <div key={comment.id} className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{comment.nickname}</p>
                <p className="text-xs text-slate-500">
                  {new Date(comment.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{comment.content}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-xs font-semibold text-primary"
                  onClick={() => {
                    setReplyToId((current) => (current === comment.id ? null : comment.id));
                    setReplyContent("");
                  }}
                >
                  {replyToId === comment.id ? "Cancel reply" : "Reply"}
                </button>
              </div>

              {replyToId === comment.id ? (
                <form onSubmit={onReplySubmit} className="space-y-2 rounded-xl border border-slate-200 p-3">
                  <Label htmlFor={`reply-content-${comment.id}`}>Your reply</Label>
                  <Textarea
                    id={`reply-content-${comment.id}`}
                    value={replyContent}
                    onChange={(event) => setReplyContent(event.target.value)}
                    placeholder={`Reply to ${comment.nickname}...`}
                    maxLength={2000}
                    required
                  />
                  <Button type="submit" size="sm" disabled={submitting || cooldownLeft > 0}>
                    {submitting ? "Posting..." : cooldownLeft > 0 ? `Please wait ${cooldownLeft}s` : "Post reply"}
                  </Button>
                </form>
              ) : null}

              {(repliesByParentId[comment.id] ?? []).length > 0 ? (
                <div className="space-y-2 border-l border-slate-200 pl-4">
                  {(repliesByParentId[comment.id] ?? []).map((reply) => (
                    <div key={reply.id} className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{reply.nickname}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(reply.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{reply.content}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
