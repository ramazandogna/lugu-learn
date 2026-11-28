-- The warm-up game (`review`) no longer opens the lesson: it runs after the new words are learned.
create or replace function lugu.section_keys() returns text[]
language sql immutable parallel safe set search_path = '' as $$
  select array['vocabulary', 'vocab_quiz', 'review', 'story', 'explanation', 'homework', 'assessment']
$$;
