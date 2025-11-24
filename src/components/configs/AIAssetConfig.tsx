import { useState } from 'react'

interface AIAssetConfigProps {
  data: Record<string, unknown>
  onUpdate: (field: string, value: unknown) => void
}

const TTS_MODELS = [
  { value: 'gpt-4o-mini-tts', label: 'GPT-4o Mini TTS' },
  { value: 'tts-1', label: 'TTS-1' },
  { value: 'tts-1-hd', label: 'TTS-1 HD' },
]

const STT_MODELS = [
  { value: 'gpt-4o-transcribe', label: 'GPT-4o Transcribe' },
  { value: 'gpt-4o-mini-transcribe', label: 'GPT-4o Mini Transcribe' },
  { value: 'gpt-4o-transcribe-diarize', label: 'GPT-4o Transcribe Diarize' },
  { value: 'whisper-1', label: 'Whisper-1' },
]

const IMAGE_MODELS = [
  { value: 'gpt-image-1', label: 'GPT Image-1' },
  { value: 'gpt-image-1-mini', label: 'GPT Image-1 Mini' },
  { value: 'dall-e-2', label: 'DALL-E 2' },
]

const VIDEO_MODELS = [
  { value: 'sora-2', label: 'Sora-2' },
  { value: 'sora-2-pro', label: 'Sora-2 Pro' },
]

const EMBEDDING_MODELS = [
  { value: 'text-embedding-3-small', label: 'Text Embedding 3 Small' },
  { value: 'text-embedding-3-large', label: 'Text Embedding 3 Large' },
]

export default function AIAssetConfig({ data, onUpdate }: AIAssetConfigProps) {
  const assetType = (data.assetType as 'tts' | 'stt' | 'image' | 'video' | 'embedding') || 'image'
  const model = (data.model as string) || ''

  const getModels = () => {
    switch (assetType) {
      case 'tts':
        return TTS_MODELS
      case 'stt':
        return STT_MODELS
      case 'image':
        return IMAGE_MODELS
      case 'video':
        return VIDEO_MODELS
      case 'embedding':
        return EMBEDDING_MODELS
      default:
        return IMAGE_MODELS
    }
  }

  const getDefaultModel = () => {
    const models = getModels()
    return models[0]?.value || ''
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="ai-asset-type" className="block text-sm font-medium text-gray-700 mb-1">
          Asset Type <span className="text-red-500">*</span>
        </label>
        <select
          id="ai-asset-type"
          value={assetType}
          onChange={(e) => {
            const newType = e.target.value as 'tts' | 'stt' | 'image' | 'video' | 'embedding'
            onUpdate('assetType', newType)
            // Reset model when type changes - need to get models for new type
            const getModelsForType = (type: typeof newType) => {
              switch (type) {
                case 'tts': return TTS_MODELS
                case 'stt': return STT_MODELS
                case 'image': return IMAGE_MODELS
                case 'video': return VIDEO_MODELS
                case 'embedding': return EMBEDDING_MODELS
                default: return IMAGE_MODELS
              }
            }
            const models = getModelsForType(newType)
            onUpdate('model', models[0]?.value || '')
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="tts">Text-to-Speech (TTS)</option>
          <option value="stt">Speech-to-Text (STT)</option>
          <option value="image">Image Generation</option>
          <option value="video">Video Generation</option>
          <option value="embedding">Embeddings</option>
        </select>
      </div>

      <div>
        <label htmlFor="ai-asset-model" className="block text-sm font-medium text-gray-700 mb-1">
          Model <span className="text-red-500">*</span>
        </label>
        <select
          id="ai-asset-model"
          value={model || getDefaultModel()}
          onChange={(e) => onUpdate('model', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {getModels().map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* TTS Fields */}
      {assetType === 'tts' && (
        <>
          <div>
            <label htmlFor="ai-tts-input" className="block text-sm font-medium text-gray-700 mb-1">
              Text Input <span className="text-red-500">*</span>
            </label>
            <textarea
              id="ai-tts-input"
              value={(data.input as string) || ''}
              onChange={(e) => onUpdate('input', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Enter text to convert to speech. Use $json.property, $env.VARIABLE_NAME, or $node.key"
            />
          </div>
          <div>
            <label htmlFor="ai-tts-voice" className="block text-sm font-medium text-gray-700 mb-1">
              Voice
            </label>
            <select
              id="ai-tts-voice"
              value={(data.voice as string) || 'default'}
              onChange={(e) => onUpdate('voice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="alloy">Alloy</option>
              <option value="verse">Verse</option>
              <option value="nova">Nova</option>
              <option value="shimmer">Shimmer</option>
              <option value="default">Default</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ai-tts-format" className="block text-sm font-medium text-gray-700 mb-1">
                Format (optional)
              </label>
              <select
                id="ai-tts-format"
                value={(data.format as string) || ''}
                onChange={(e) => onUpdate('format', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Default (mp3)</option>
                <option value="mp3">MP3</option>
                <option value="opus">Opus</option>
                <option value="aac">AAC</option>
                <option value="flac">FLAC</option>
                <option value="wav">WAV</option>
                <option value="pcm">PCM</option>
              </select>
            </div>
            <div>
              <label htmlFor="ai-tts-speed" className="block text-sm font-medium text-gray-700 mb-1">
                Speed (optional)
              </label>
              <select
                id="ai-tts-speed"
                value={(data.speed as string) || ''}
                onChange={(e) => onUpdate('speed', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Default (1.0)</option>
                <option value="0.25">0.25x (Very Slow)</option>
                <option value="0.5">0.5x (Slow)</option>
                <option value="0.75">0.75x (Slightly Slow)</option>
                <option value="1.0">1.0x (Normal)</option>
                <option value="1.25">1.25x (Slightly Fast)</option>
                <option value="1.5">1.5x (Fast)</option>
                <option value="1.75">1.75x (Very Fast)</option>
                <option value="2.0">2.0x (Extremely Fast)</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="ai-tts-emotion" className="block text-sm font-medium text-gray-700 mb-1">
              Emotion (optional)
            </label>
            <select
              id="ai-tts-emotion"
              value={(data.emotion as string) || ''}
              onChange={(e) => onUpdate('emotion', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">None (Neutral)</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="angry">Angry</option>
              <option value="excited">Excited</option>
              <option value="calm">Calm</option>
              <option value="friendly">Friendly</option>
              <option value="serious">Serious</option>
              <option value="whisper">Whisper</option>
            </select>
          </div>
        </>
      )}

      {/* STT Fields */}
      {assetType === 'stt' && (
        <>
          <div>
            <label htmlFor="ai-stt-audio" className="block text-sm font-medium text-gray-700 mb-1">
              Audio File URL <span className="text-red-500">*</span>
            </label>
            <input
              id="ai-stt-audio"
              type="text"
              value={(data.audioUrl as string) || ''}
              onChange={(e) => onUpdate('audioUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter audio file URL or use $json.property"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL to audio file (mp3, mp4, mpeg, mpga, m4a, wav, webm)
            </p>
          </div>
          <div>
            <label htmlFor="ai-stt-language" className="block text-sm font-medium text-gray-700 mb-1">
              Language (optional)
            </label>
            <input
              id="ai-stt-language"
              type="text"
              value={(data.language as string) || ''}
              onChange={(e) => onUpdate('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., en, es, fr (ISO 639-1)"
            />
          </div>
        </>
      )}

      {/* Image Fields */}
      {assetType === 'image' && (
        <>
          <div>
            <label htmlFor="ai-image-prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              id="ai-image-prompt"
              value={(data.prompt as string) || ''}
              onChange={(e) => onUpdate('prompt', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Describe the image you want to generate. Use $json.property, $env.VARIABLE_NAME, or $node.key"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ai-image-size" className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <select
                id="ai-image-size"
                value={(data.size as string) || '1024x1024'}
                onChange={(e) => onUpdate('size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="256x256">256x256</option>
                <option value="512x512">512x512</option>
                <option value="1024x1024">1024x1024</option>
                <option value="1792x1024">1792x1024</option>
                <option value="1024x1792">1024x1792</option>
              </select>
            </div>
            <div>
              <label htmlFor="ai-image-quality" className="block text-sm font-medium text-gray-700 mb-1">
                Quality
              </label>
              <select
                id="ai-image-quality"
                value={(data.quality as string) || 'standard'}
                onChange={(e) => onUpdate('quality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="standard">Standard</option>
                <option value="hd">HD</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="ai-image-n" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Images
            </label>
            <input
              id="ai-image-n"
              type="number"
              min="1"
              max="10"
              value={(data.n as number) ?? 1}
              onChange={(e) => onUpdate('n', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">1 - 10 (default: 1)</p>
          </div>
        </>
      )}

      {/* Video Fields */}
      {assetType === 'video' && (
        <>
          <div>
            <label htmlFor="ai-video-prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              id="ai-video-prompt"
              value={(data.prompt as string) || ''}
              onChange={(e) => onUpdate('prompt', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Describe the video you want to generate. Use $json.property, $env.VARIABLE_NAME, or $node.key"
            />
          </div>
          <div>
            <label htmlFor="ai-video-duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (seconds)
            </label>
            <input
              id="ai-video-duration"
              type="number"
              min="1"
              max="60"
              value={(data.duration as number) ?? 10}
              onChange={(e) => onUpdate('duration', parseInt(e.target.value) || 10)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">1 - 60 seconds (default: 10)</p>
          </div>
        </>
      )}

      {/* Embedding Fields */}
      {assetType === 'embedding' && (
        <>
          <div>
            <label htmlFor="ai-embedding-input" className="block text-sm font-medium text-gray-700 mb-1">
              Text Input <span className="text-red-500">*</span>
            </label>
            <textarea
              id="ai-embedding-input"
              value={(data.input as string) || ''}
              onChange={(e) => onUpdate('input', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Enter text to generate embeddings. Use $json.property, $env.VARIABLE_NAME, or $node.key"
            />
          </div>
          <div>
            <label htmlFor="ai-embedding-dimensions" className="block text-sm font-medium text-gray-700 mb-1">
              Dimensions (optional)
            </label>
            <input
              id="ai-embedding-dimensions"
              type="number"
              min="1"
              value={(data.dimensions as number) || ''}
              onChange={(e) => onUpdate('dimensions', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Leave empty for default"
            />
            <p className="text-xs text-gray-500 mt-1">Optional: Specify embedding dimensions</p>
          </div>
        </>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Requires OpenAI API key. Configure it in workflow settings or environment variables using <code className="bg-yellow-100 px-1 rounded">$env.OPENAI_API_KEY</code>.
        </p>
      </div>
    </div>
  )
}

