import { useReveal } from '../hooks'

export default function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const [ref, shown] = useReveal()
  return <Tag ref={ref} className={`rv ${shown ? 'in' : ''} ${className}`} {...rest}>{children}</Tag>
}
