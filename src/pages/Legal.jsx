const Legal = () => {
  return (
    <div style={containerStyle}>
      <h1 style={mainTitleStyle}>Información Legal y Licencias</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>Última actualización: {new Date().toLocaleDateString()}</p>

      {/* NUEVA SECCIÓN: Licencias de Uso */}
      <section style={sectionStyle}>
        <h2 style={subTitleStyle}>1. Licencias de Uso Musical</h2>
        <p>Toda la música disponible en <strong>Creo Music</strong> está sujeta a las siguientes condiciones de licencia:</p>
        <div style={licenseBoxStyle}>
          <p><strong>Uso Personal:</strong> Puedes escuchar, descargar (si está habilitado) y disfrutar de las pistas de forma gratuita para tu disfrute privado.</p>
          <p><strong>Creadores de Contenido:</strong> Se permite el uso de las canciones en plataformas como YouTube, Twitch o Instagram siempre que se otorgue el crédito correspondiente al artista (Ej: <em>Música de Creo - [Nombre de la canción]</em>).</p>
          <p><strong>Uso Comercial:</strong> El uso de estas pistas en publicidad, radio, televisión o películas requiere una licencia comercial específica. Ponte en contacto con nosotros para gestionar estos derechos.</p>
        </div>
      </section>

      <hr style={dividerStyle} />

      {/* Sección: Términos de Uso */}
      <section style={sectionStyle}>
        <h2 style={subTitleStyle}>2. Términos de Servicio</h2>
        <p>Al acceder a nuestra plataforma, aceptas:</p>
        <ul style={listStyle}>
          <li>No utilizar scripts o bots para inflar artificialmente el número de reproducciones.</li>
          <li>No reclamar la autoría de ninguna obra alojada en este sitio.</li>
          <li>Respetar la integridad de los archivos de audio originales.</li>
        </ul>
      </section>

      <hr style={dividerStyle} />

      {/* Sección: Política de Privacidad */}
      <section style={sectionStyle}>
        <h2 style={subTitleStyle}>3. Política de Privacidad</h2>
        <p>Tus datos se manejan de la siguiente forma:</p>
        <ul style={listStyle}>
          <li><strong>Datos:</strong> Nombre y email para gestionar tu cuenta.</li>
          <li><strong>Cookies:</strong> Usamos cookies técnicas para mantener tu sesión activa.</li>
        </ul>
      </section>
    </div>
  );
};

// --- ESTILOS EXTRA ---
const licenseBoxStyle = {
  background: '#f9f9f9',
  borderLeft: '4px solid #1db954',
  padding: '15px',
  marginTop: '10px',
  fontSize: '0.95rem'
};

// ... (Mantén los estilos anteriores de containerStyle, mainTitleStyle, etc.)
const containerStyle = { maxWidth: '800px', margin: '60px auto', padding: '0 20px', lineHeight: '1.6', color: '#333' };
const mainTitleStyle = { fontSize: '2.5rem', marginBottom: '10px' };
const sectionStyle = { marginBottom: '30px' };
const subTitleStyle = { fontSize: '1.5rem', color: '#1db954', marginBottom: '15px' };
const listStyle = { paddingLeft: '20px' };
const dividerStyle = { border: '0', borderTop: '1px solid #eee', margin: '40px 0' };

export default Legal;