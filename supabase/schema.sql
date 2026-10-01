create table settings (key text primary key, value jsonb not null);
insert into settings values ('semester2_live','false');
create table courses (
  id text primary key, title text not null,
  semester int not null check (semester in (1,2)), sort int default 0
);
insert into courses values
('ai1','الذكاء الاصطناعي 1',1,1),('net1','شبكات الحاسوب 1',1,2),
('ds2','هياكل البيانات والخوارزميات 2',1,3),('web','تكنولوجيا المواقع',1,4),
('cg','الرسم بالحاسوب',1,5),('ai2','الذكاء الاصطناعي 2',2,1),
('net2','شبكات الحاسوب 2',2,2),('comp','المترجمات',2,3),
('se','هندسة البرمجيات',2,4),('or','بحوث العمليات',2,5);
create table materials (
  id uuid primary key default gen_random_uuid(),
  course_id text references courses(id) on delete cascade,
  category text not null check (category in ('lecture','lab','summary','exam_past','exam_current')),
  title text not null, lecture_no int, tags text[],
  file_path text, code text, lang text,
  created_at timestamptz default now()
);
create table announcements (
  id uuid primary key default gen_random_uuid(),
  body text not null, created_at timestamptz default now()
);
alter table settings enable row level security;
alter table courses enable row level security;
alter table materials enable row level security;
alter table announcements enable row level security;
create policy "read" on settings for select using (true);
create policy "read" on courses for select using (true);
create policy "read" on materials for select using (true);
create policy "read" on announcements for select using (true);
create policy "admin" on settings for all to authenticated using (true) with check (true);
create policy "admin" on courses for all to authenticated using (true) with check (true);
create policy "admin" on materials for all to authenticated using (true) with check (true);
create policy "admin" on announcements for all to authenticated using (true) with check (true);
-- Storage: create a PUBLIC bucket named "materials", then:
create policy "admin write" on storage.objects for all to authenticated
  using (bucket_id='materials') with check (bucket_id='materials');

-- Step 4: weekly timetable
create table timetable (
  id uuid primary key default gen_random_uuid(),
  semester int not null check (semester in (1,2)),
  section text not null check (section in ('A','B')),
  day int not null check (day between 0 and 4), -- 0=الأحد ... 4=الخميس
  start_time text not null, end_time text not null,
  subject text not null, room text,
  created_at timestamptz default now()
);
alter table timetable enable row level security;
create policy "read" on timetable for select using (true);
create policy "admin" on timetable for all to authenticated using (true) with check (true);
