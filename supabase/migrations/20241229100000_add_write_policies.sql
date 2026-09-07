-- ============================================================
-- 챕터 09 : 쓰기(생성/수정/삭제) RLS 정책
--
-- 교재에서는 홈페이지를 먼저 만들 때 "조회" 정책만 생성했기 때문에
-- 글쓰기 페이지에서 new row violates row-level security policy 오류가 납니다.
-- 이 마이그레이션이 그 오류를 해결하는 쓰기 정책입니다.
-- ============================================================

-- ------------------------------------------------------------
-- posts : 로그인한 사용자는 "본인 이름으로만" 글을 쓰고, 본인 글만 수정/삭제
-- ------------------------------------------------------------
create policy "Authenticated users can create posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can update their own posts"
  on public.posts for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = author_id);

-- ------------------------------------------------------------
-- comments : 로그인한 사용자는 댓글 작성 가능, 본인 댓글만 삭제
-- ------------------------------------------------------------
create policy "Authenticated users can create comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  to authenticated
  using (auth.uid() = author_id);

-- ------------------------------------------------------------
-- likes : 본인 좋아요만 추가/취소 가능
-- ------------------------------------------------------------
create policy "Authenticated users can like posts"
  on public.likes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unlike their own likes"
  on public.likes for delete
  to authenticated
  using (auth.uid() = user_id);
