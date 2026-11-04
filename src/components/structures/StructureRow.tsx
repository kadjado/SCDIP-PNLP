function StructureRow({ label, count, icon }: { label: string; count: number; icon: string }) {
  return (
    <div className="structure-row">
      <span className="structure-row-icon">{icon}</span>
      <span>{label}</span>
      <strong>{count}</strong>
    </div>
  )
}

export default StructureRow
