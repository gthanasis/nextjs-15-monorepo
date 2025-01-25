import Modal from '@/components/modals/Modal'
import { LoginForm } from '@/components/forms/LoginForm'
import { useEffect } from 'react'
import renderGoogleButton from '@/lib/render-google-button'

type Props = {
  trigger: React.ReactNode
  onTrigger?: () => void
}

export default function LoginModal(props: Props) {
  const { trigger, onTrigger } = props
  return (
    <Modal trigger={trigger}>
      <LoginForm onClick={onTrigger} />
    </Modal>
  )
}
