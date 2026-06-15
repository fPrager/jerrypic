const slug = document.body.dataset.slug
const dropzone = document.getElementById('dropzone')
const fileInput = document.getElementById('file')
const status = document.getElementById('status')

const ALLOWED_TYPES = ['image/png', 'image/jpeg']

const setStatus = (message, isError) => {
  status.textContent = message
  status.classList.toggle('error', Boolean(isError))
}

const upload = async (file) => {
  if (!file) return
  if (!ALLOWED_TYPES.includes(file.type)) {
    setStatus('Only JPG and PNG files are allowed.', true)
    return
  }

  setStatus('Uploading…')
  try {
    const response = await fetch(`/yours/@${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    if (!response.ok) {
      throw new Error(`upload failed (${response.status})`)
    }
    setStatus('Uploaded!')
    // Reload so the server re-renders the page with the new image + download URL.
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
