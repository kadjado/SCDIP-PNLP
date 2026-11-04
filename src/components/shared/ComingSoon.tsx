import Icon from './Icon'

type ComingSoonProps = {
  icon: string
  text: string
}

function ComingSoon({ icon, text }: ComingSoonProps) {
  return (
    <section className="panel list-panel">
      <div className="empty-state">
        <span><Icon name={icon} /></span>
        <p>{text}</p>
      </div>
    </section>
  )
}

export default ComingSoon
