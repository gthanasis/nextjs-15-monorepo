import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type Props = {
  trigger?: React.ReactNode
  title?: React.ReactNode
  children: React.ReactNode
  actions?: React.ReactNode
}

export default function Modal(props: Props) {
  const { children, title = '', actions, trigger } = props
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {children}
        </DialogHeader>
      </DialogContent>
      {actions && <DialogFooter className="sm:justify-start">{actions}</DialogFooter>}
    </Dialog>
  )
}
