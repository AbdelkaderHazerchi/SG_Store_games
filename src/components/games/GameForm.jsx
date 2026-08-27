import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Info } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import ImageUploader from '../common/ImageUploader';
import { useGames } from '../../context/GameContext';
import { GENRES, LIMITS } from '../../utils/constants';
import { isValidHttpsUrl } from '../../utils/helpers';

const initialData = {
  title: '',
  description: '',
  playUrl: '',
  genre: GENRES[0],
  developerNote: '',
  isAiGenerated: false,
  coverImage: '',
  screenshots: [],
};

export default function GameForm({ existingGame }) {
  const navigate = useNavigate();
  const { createGame, updateGame } = useGames();
  const [form, setForm] = useState(
    existingGame
      ? {
          title: existingGame.title || '',
          description: existingGame.description || '',
          playUrl: existingGame.playUrl || '',
          genre: existingGame.genre || GENRES[0],
          developerNote: existingGame.developerNote || '',
          isAiGenerated: !!existingGame.isAiGenerated,
          coverImage: existingGame.coverImage || '',
          screenshots: existingGame.screenshots || [],
        }
      : initialData
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    else if (form.title.length > LIMITS.MAX_TITLE_LENGTH)
      next.title = `Max ${LIMITS.MAX_TITLE_LENGTH} characters.`;
    if (!form.description.trim()) next.description = 'Description is required.';
    else if (form.description.length > LIMITS.MAX_DESCRIPTION_LENGTH)
      next.description = `Max ${LIMITS.MAX_DESCRIPTION_LENGTH} characters.`;
    if (!form.playUrl.trim()) next.playUrl = 'Play link is required.';
    else if (!isValidHttpsUrl(form.playUrl))
      next.playUrl = 'Link must be a valid HTTPS URL.';
    if (!form.coverImage) next.coverImage = 'A game cover image is required.';
    if ((form.developerNote || '').length > LIMITS.MAX_DEV_NOTE_LENGTH)
      next.developerNote = `Max ${LIMITS.MAX_DEV_NOTE_LENGTH} characters.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        playUrl: form.playUrl.trim(),
        genre: form.genre,
        developerNote: form.developerNote.trim(),
        isAiGenerated: form.isAiGenerated,
        coverImage: form.coverImage,
        screenshots: form.screenshots.slice(0, LIMITS.MAX_SCREENSHOTS),
      };
      if (existingGame) {
        await updateGame(existingGame.id, payload);
        navigate(`/game/${existingGame.id}`);
      } else {
        const id = await createGame(payload);
        navigate(`/game/${id}`);
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Game Title"
        name="title"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        placeholder="My Awesome Browser Game"
        maxLength={LIMITS.MAX_TITLE_LENGTH}
        error={errors.title}
      />

      <Textarea
        label="Description"
        name="description"
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        placeholder="What is your game about? Controls, features, story…"
        maxLength={LIMITS.MAX_DESCRIPTION_LENGTH}
        rows={6}
        error={errors.description}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Play Link (HTTPS)"
          name="playUrl"
          type="url"
          value={form.playUrl}
          onChange={(e) => set('playUrl', e.target.value)}
          placeholder="https://yourname.github.io/my-game/"
          hint="GitHub Pages, itch.io, Netlify…"
          error={errors.playUrl}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Genre</label>
          <select
            value={form.genre}
            onChange={(e) => set('genre', e.target.value)}
            className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ImageUploader
        label="Cover Image (required)"
        images={form.coverImage}
        onChange={(url) => set('coverImage', url)}
        max={1}
        error={errors.coverImage}
      />

      <ImageUploader
        label="Screenshots"
        images={form.screenshots}
        onChange={(shots) => set('screenshots', shots)}
        max={LIMITS.MAX_SCREENSHOTS}
      />

      <Textarea
        label="Developer Notes (optional)"
        name="developerNote"
        value={form.developerNote}
        onChange={(e) => set('developerNote', e.target.value)}
        placeholder="Requirements, controls, known issues…"
        maxLength={LIMITS.MAX_DEV_NOTE_LENGTH}
        error={errors.developerNote}
      />

      <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-900/70 p-4 ring-1 ring-slate-800">
        <input
          type="checkbox"
          checked={form.isAiGenerated}
          onChange={(e) => set('isAiGenerated', e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        <span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-white">
            <Bot className="h-4 w-4 text-purple-400" />
            This game was created with AI assistance
          </span>
          <span className="mt-1 block text-xs text-slate-400">
            Transparency matters — AI-assisted games receive a visible badge on their page.
            False claims can be reported.
          </span>
        </span>
      </label>

      {submitError && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {submitError}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" loading={submitting}>
          {existingGame ? 'Save Changes' : 'Publish Game'}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      {!existingGame && (
        <p className="flex items-start gap-2 text-xs text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          You can publish up to {LIMITS.MAX_GAMES_PER_USER} games per account.
        </p>
      )}
    </form>
  );
}
