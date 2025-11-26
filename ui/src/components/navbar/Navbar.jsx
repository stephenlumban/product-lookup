import React from "react";
import styles from "./Navbar.module.css";

function Navbar({ query, setQuery, onAddProductClick }) {
  return (
    <header className={styles.navbar}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Product Lookup</h1>

        <div className={styles.searchControls}>
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />

          <button onClick={onAddProductClick} className={styles.addButton}>
            + Add Product
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
