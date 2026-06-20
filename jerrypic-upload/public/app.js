const slug = document.body.dataset.slug
const dropzone = document.getElementById('dropzone')
const fileInput = document.getElementById('file')
const status = document.getElementById('status')

const ALLOWED_TYPES = ['image/png', 'image/jpeg']

const setStatus = (message, isError) => {
  status.textContent = message
  status.classList.toggle('error', Boolean(isError))
}

// ---- Upload ----------------------------------------------------------------

const upload = async (file) => {
  if (!file) return
  if (!ALLOWED_TYPES.includes(file.type)) {
    setStatus('Only JPG and PNG files are allowed.', true)
    return
  }

  setStatus('Uploading…')
  try {
    const response = await fetch(`/yours/@${slug}/raw`, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    if (!response.ok) {
      throw new Error(`upload failed (${response.status})`)
    }
    setStatus('Uploaded!')
    // Reload so the server re-renders with the new image + preview.
    window.location.reload()
  } catch (error) {
    setStatus(error.message, true)
  }
}

dropzone.addEventListener('click', () => fileInput.click())
fileInput.addEventListener('change', () => upload(fileInput.files[0]))
;['dragenter', 'dragover'].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault()
    dropzone.classList.add('over')
  })
})
;['dragleave', 'drop'].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault()
    dropzone.classList.remove('over')
  })
})
dropzone.addEventListener('drop', (event) => {
  upload(event.dataTransfer.files[0])
})

// ---- Pipeline editor -------------------------------------------------------

const state = JSON.parse(document.getElementById('pipeline-state').textContent)
const { outputUrl, catalog, rawSize } = state
let pipeline = state.pipeline

const catalogByType = Object.fromEntries(catalog.map((entry) => [entry.type, entry]))

const pipeEl = document.getElementById('pipe')
const addSelect = document.getElementById('add-step')
const addBtn = document.getElementById('add-step-btn')
const pipeStatus = document.getElementById('pipe-status')

const debounce = (fn, ms) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

const refreshOutput = () => {
  const img = document.getElementById('output-img')
  if (img) img.src = `${outputUrl}?t=${Date.now()}`
}

const save = debounce(async () => {
  pipeStatus.textContent = 'Saving…'
  try {
    const response = await fetch(`/yours/@${slug}/pipeline`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pipeline),
    })
    if (!response.ok) throw new Error(`save failed (${response.status})`)
    pipeStatus.textContent = 'Saved'
    refreshOutput()
  } catch (error) {
    pipeStatus.textContent = error.message
  }
}, 500)

// Defaults for a freshly added step; a resize step starts at the raw image size.
const defaultsFor = (type) => {
  const def = catalogByType[type]
  const params = {}
  def.params.forEach((spec) => {
    params[spec.name] = spec.default
  })
  if (type === 'resize') {
    if (rawSize.width) params.width = rawSize.width
    if (rawSize.height) params.height = rawSize.height
  }
  return params
}

const paramControl = (step, spec) => {
  if (spec.type === 'boolean') {
    const label = document.createElement('label')
    label.className = 'param param--check'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = Boolean(step.params[spec.name])
    input.addEventListener('change', () => {
      step.params[spec.name] = input.checked
      save()
    })
    label.append(input, document.createTextNode(spec.label))
    return label
  }

  const label = document.createElement('label')
  label.className = 'param'
  const caption = document.createElement('span')
  caption.textContent = spec.label
  label.appendChild(caption)

  if (spec.type === 'select') {
    const select = document.createElement('select')
    spec.options.forEach((option) => {
      const el = document.createElement('option')
      el.value = option.value
      el.textContent = option.label
      if (step.params[spec.name] === option.value) el.selected = true
      select.appendChild(el)
    })
    select.addEventListener('change', () => {
      step.params[spec.name] = select.value
      save()
    })
    label.appendChild(select)
    return label
  }

  // number
  const input = document.createElement('input')
  input.type = 'number'
  input.value = step.params[spec.name]
  if (spec.min != null) input.min = spec.min
  if (spec.max != null) input.max = spec.max
  if (spec.step != null) input.step = spec.step
  input.addEventListener('input', () => {
    step.params[spec.name] = input.value === '' ? 0 : Number(input.value)
    save()
  })
  label.appendChild(input)
  return label
}

const move = (index, delta) => {
  const target = index + delta
  if (target < 0 || target > pipeline.length - 2) return
  ;[pipeline[index], pipeline[target]] = [pipeline[target], pipeline[index]]
  renderPipe()
  save()
}

const removeStep = (index) => {
  pipeline.splice(index, 1)
  renderPipe()
  save()
}

const addStep = (type) => {
  if (!type) return
  pipeline.splice(pipeline.length - 1, 0, { type, params: defaultsFor(type) })
  renderPipe()
  save()
}

const controlButton = (label, onClick, disabled) => {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = label
  button.disabled = Boolean(disabled)
  button.addEventListener('click', onClick)
  return button
}

function renderPipe() {
  pipeEl.innerHTML = ''
  const lastTransform = pipeline.length - 2 // the target step is always last

  pipeline.forEach((step, index) => {
    const def = catalogByType[step.type]
    if (!def) return

    const card = document.createElement('div')
    card.className = def.isTarget ? 'step step--target' : 'step'

    const head = document.createElement('div')
    head.className = 'step__head'
    const name = document.createElement('span')
    name.className = 'step__name'
    name.textContent = def.label
    head.appendChild(name)

    if (!def.isTarget) {
      const ctrls = document.createElement('div')
      ctrls.className = 'step__ctrls'
      ctrls.append(
        controlButton('↑', () => move(index, -1), index === 0),
        controlButton('↓', () => move(index, 1), index === lastTransform),
        controlButton('✕', () => removeStep(index)),
      )
      head.appendChild(ctrls)
    }
    card.appendChild(head)

    if (def.params.length) {
      const params = document.createElement('div')
      params.className = 'step__params'
      def.params.forEach((spec) => params.appendChild(paramControl(step, spec)))
      card.appendChild(params)
    }

    pipeEl.appendChild(card)
  })
}

// Populate the "add step" picker with every non-target transform.
catalog
  .filter((entry) => !entry.isTarget)
  .forEach((entry) => {
    const option = document.createElement('option')
    option.value = entry.type
    option.textContent = entry.label
    addSelect.appendChild(option)
  })

addBtn.addEventListener('click', () => addStep(addSelect.value))

renderPipe()
