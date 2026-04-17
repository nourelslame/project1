// src/components/CompanyLogo.jsx
// Shared component — shows the company logo image if available,
// otherwise shows the first letter of the company name.
// Use this everywhere a company logo should appear.
//
// Usage:
//   <CompanyLogo logo={offer.companyId?.logo} name={offer.companyId?.name} size={52} />

const BASE_URL = 'http://localhost:5000';

export default function CompanyLogo({ logo, name = 'C', size = 52, style = {} }) {
  // The logo field from the DB looks like "/uploads/logos/xxx.png"
  const src = logo ? `${BASE_URL}${logo}` : null;

  const circleStyle = {
    width:          size,
    height:         size,
    borderRadius:   size * 0.27,          // proportional radius
    overflow:       'hidden',
    flexShrink:     0,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    background:     src ? 'transparent' : 'linear-gradient(135deg, #7c3aed, #9333ea)',
    color:          '#fff',
    fontSize:       size * 0.38,
    fontWeight:     700,
    ...style,
  };

  if (src) {
    return (
      <div style={circleStyle}>
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          // On error (image broken), fall back to initials
          onError={e => {
            e.target.style.display = 'none';
            e.target.parentNode.innerText = (name || 'C').charAt(0).toUpperCase();
          }}
        />
      </div>
    );
  }

  return (
    <div style={circleStyle}>
      {(name || 'C').charAt(0).toUpperCase()}
    </div>
  );
}