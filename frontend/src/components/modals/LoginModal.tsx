import Modal from '@/components/modals/Modal'
import { LoginForm } from '@/components/forms/LoginForm'

type Props = {
  trigger: React.ReactNode
}

export default function LoginModal(props: Props) {
  const { trigger } = props
  return (
    <Modal trigger={trigger}>
      <LoginForm />
    </Modal>
  )
}
