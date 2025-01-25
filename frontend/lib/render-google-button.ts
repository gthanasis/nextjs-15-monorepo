const renderGoogleButton = (id: string) => {
  const scriptExists = typeof window !== 'undefined' && window.google?.accounts?.id
  const element = document.getElementById(id)
  if (!scriptExists || !element) return
  window.google.accounts.id.renderButton(
    element,
    { theme: 'outline', size: 'large' } // customization attributes
  )
}

export default renderGoogleButton
