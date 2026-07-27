import { useState } from 'react';
import { NavLink } from 'react-router';
import './Navigation.css';

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="mobile-header">
        <div className="mobile-brand">
          <span className="mobile-logo">HD</span>

          <div>
            <strong>Help Desk</strong>
            <small>Soporte técnico</small>
          </div>
        </div>

        <button
          className="menu-button"
          type="button"
          aria-label="Abrir o cerrar menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <button
          className="menu-overlay"
          type="button"
          aria-label="Cerrar menú"
          onClick={closeMenu}
        />
      )}

      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo">HD</div>

          <div className="brand-text">
            <h2>Help Desk</h2>
            <p>Gestión de incidencias</p>
          </div>
        </div>

        <nav className="navigation-menu">
          <p className="menu-label">MENÚ PRINCIPAL</p>

          <NavLink
            to="/"
            end
            onClick={closeMenu}
            className={({ isActive }) =>
              `navigation-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="navigation-icon">▦</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/registrar-incidente"
            onClick={closeMenu}
            className={({ isActive }) =>
              `navigation-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="navigation-icon">＋</span>
            <span>Registrar incidente</span>
          </NavLink>

          <NavLink
            to="/tickets"
            onClick={closeMenu}
            className={({ isActive }) =>
              `navigation-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="navigation-icon">≡</span>
            <span>Listado de tickets</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">AD</div>

          <div>
            <strong>Administrador</strong>
            <span>Soporte técnico</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Navigation;