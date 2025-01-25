import Modal from '@/components/modals/Modal'
import { LoginForm } from '@/components/forms/LoginForm'

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
