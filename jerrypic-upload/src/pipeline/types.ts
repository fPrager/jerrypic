import { Jimp } from 'jimp'

/** A decoded Jimp image instance — what transform steps mutate in place. */
export type PipelineImage = Awaited<ReturnType<typeof Jimp.read>>

/** A single configurable parameter. Drives both server-side validation and the editor UI. */
export type ParamSpec =
  | {
      name: string
      label: string
      type: 'number'
      default: number
      min: number
      max: number
      step?: number
      /** When false the value may be fractional (e.g. contrast); otherwise it is rounded. */
      integer?: boolean
      /** When true a value of 0 means "unset" and is left as 0 instead of being clamped up to min. */
      optional?: boolean
    }
  | { name: string; label: string; type: 'boolean'; default: boolean }
  | { name: string; label: string; type: 'select'; default: string; options: readonly { value: string; label: string }[] }

/** A configured step in a stored pipeline. */
export type Step = { type: string; params: Record<string, unknown> }

/** The definition of a transform (or the target encode step) the editor offers. */
export type StepDefinition = {
  type: string
  label: string
  params: readonly ParamSpec[]
  /** Transform steps mutate the image in place. */
  apply?: (image: PipelineImage, params: Record<string, unknown>) => void
  /** The single target step encodes the final buffer instead of mutating. */
  encode?: (image: PipelineImage, params: Record<string, unknown>) => Promise<{ buffer: Buffer; contentType: string }>
  /** Marks the always-last output-format step. */
  isTarget?: boolean
}
