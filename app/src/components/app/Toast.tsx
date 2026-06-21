interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 26,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 90,
      background: '#1a1a1a',
      color: '#fff',
      borderRadius: 12,
      padding: '13px 20px',
      fontSize: '13.5px',
      boxShadow: '0 10px 40px rgba(0,0,0,.25)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9fff00' }} />
      {message}
    </div>
  );
}