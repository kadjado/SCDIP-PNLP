import type { Structure } from '../../types'
import Icon from '../shared/Icon'
import EmptyState from '../shared/EmptyState'

function StructurePanel({ title, items, icon }: { title: string; items: Structure[]; icon: string }) {
  return (
    <section className="panel structure-panel list-panel">
      <div className="panel-heading list-heading">
        <div className="list-heading-main">
          <span className="list-icon"><Icon name={icon} /></span>
          <div>
            <h2>{title}</h2>
            <p className="muted">{items.length} élément(s) chargé(s)</p>
          </div>
        </div>
      </div>
      {!items.length ? (
        <EmptyState text="Aucune donnée retournée ou accès indisponible." />
      ) : (
        <div className="structure-list">
          {items.map((item) => (
            <div className="structure-row" key={item.id}>
              <span className="structure-row-icon"><Icon name={icon} /></span>
              <span>
                <strong>{item.libelle}</strong>
                <small className="cell-sub">{item.code}</small>
              </span>
              {item.actif !== undefined && (
                <span className={`status ${item.actif ? 'confirmed' : 'inactive'}`}>
                  {item.actif ? 'Actif' : 'Inactif'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default StructurePanel
