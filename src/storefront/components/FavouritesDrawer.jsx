import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDishes } from '../hooks/useDishes';
import { useFavourites } from '../context/FavouritesContext';
import { formatMoney } from '../../lib/format';
import { IMAGES } from '../config';
import SafeImg from './SafeImg';
import { CLOSE_SVG, HEART_SVG } from './SiteHeader';

export default function FavouritesDrawer({ open, onClose }) {
  const { favs, toggle } = useFavourites();
  const { dishes } = useDishes();
  const navigate = useNavigate();

  const favDishes = useMemo(
    () => dishes.filter((dish) => favs.includes(dish.id)),
    [dishes, favs],
  );

  if (!open) return null;

  return (
    <>
      <div className="sf-drawer-overlay" onClick={onClose} />
      <div className="sf-favourites-drawer">
        <button type="button" className="sf-drawer-close" onClick={onClose} aria-label="Close favourites">
          {CLOSE_SVG}
        </button>
        <div className="sf-favourites-head">
          <h2 className="sf-favourites-title">Favourites</h2>
        </div>
        {favDishes.length === 0 ? (
          <div className="sf-favourites-empty">
            <p className="sf-favourites-empty-title">No favourites yet</p>
            <p className="sf-favourites-empty-desc">Tap the heart on any dish to save it here.</p>
            <button type="button" className="sf-btn sf-btn-primary sf-btn-block" onClick={() => { onClose(); navigate('/menu'); }}>
              Browse the menu
            </button>
          </div>
        ) : (
          <>
            <div className="sf-favourites-list">
              {favDishes.map((dish) => (
                <div key={dish.id} className="sf-favourite-line">
                  <SafeImg
                    src={dish.image_url}
                    label={dish.name || 'Dish'}
                    className="sf-favourite-line-img"
                    alt={dish.name || 'Dish'}
                    loading="lazy"
                  />
                  <div className="sf-favourite-line-body">
                    <div className="sf-favourite-line-name">{dish.name}</div>
                    <div className="sf-favourite-line-price">{formatMoney(dish.price)}</div>
                  </div>
                  <button
                    type="button"
                    className="sf-favourite-line-remove"
                    aria-label={`Remove ${dish.name} from favourites`}
                    onClick={(e) => { e.stopPropagation(); toggle(dish.id); }}
                  >
                    {HEART_SVG}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
