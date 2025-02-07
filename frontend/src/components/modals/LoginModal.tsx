import Modal from '@/components/modals/Modal'
import { LoginForm } from '@/components/forms/LoginForm'
import Link from 'next/link'

type Props = {
  trigger: React.ReactNode
}

export default function LoginModal(props: Props) {
  const { trigger } = props
  return (
    <Modal trigger={trigger}>
      <LoginForm />
      <footer className="mt-6 text-center text-sm text-gray-600">
        <p>
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-900">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-gray-900">
            Privacy Policy
          </Link>
          .
        </p>
      </footer>
    </Modal>
  )
}
