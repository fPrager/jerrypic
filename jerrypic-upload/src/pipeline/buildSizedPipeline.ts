import registry from './steps/index.js'
import type { RequestedSize } from './parseRequestedSize.js'
import type { Step } from './types.js'

const buildSizedPipeline = (pipeline: readonly Step[], requestedSize: RequestedSize | null): Step[] => {
  if (!requestedSize) return [...pipeline]

  const fillStep: Step = {
    type: 'fill',
    params: { width: requestedSize.width, height: requestedSize.height },
  }
  const targetIndex = pipeline.findIndex((step) => registry[step.type]?.isTarget)
  if (targetIndex < 0) return [...pipeline, fillStep]

  return [...pipeline.slice(0, targetIndex), fillStep, ...pipeline.slice(targetIndex)]
}

export default buildSizedPipeline
