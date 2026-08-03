import React from 'react';
import { Check, Flame, Truck, CheckCircle2, ClipboardList } from 'lucide-react';

const OrderTracker = ({ status }) => {
  const steps = [
    { label: 'Placed', icon: ClipboardList, desc: 'Order received by system' },
    { label: 'Accepted', icon: Check, desc: 'Restaurant confirmed your order' },
    { label: 'Cooking', icon: Flame, desc: 'Chef is preparing your meal' },
    { label: 'Out for Delivery', icon: Truck, desc: 'Delivery partner on the way' },
    { label: 'Delivered', icon: CheckCircle2, desc: 'Order delivered successfully' }
  ];

  const getStatusIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'Placed': return 0;
      case 'Accepted': return 1;
      case 'Cooking': return 2;
      case 'Out for Delivery': return 3;
      case 'Delivered': return 4;
      case 'Rejected': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(status);

  if (status === 'Rejected') {
    return (
      <div className="glass-card" style={{ padding: 24, borderLeft: '4px solid var(--danger)', marginTop: 20 }}>
        <h3 style={{ color: 'var(--danger)', marginBottom: 8 }}>Order Cancelled / Rejected</h3>
        <p style={{ color: 'var(--text-secondary)' }}>We apologize, but this order was rejected or cancelled by the restaurant.</p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 28, marginTop: 20 }}>
      <h3 style={{ marginBottom: 24, fontSize: 18, fontWeight: 700 }}>Real-time Delivery Status</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative' }}>
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div 
                  style={{
                    position: 'absolute',
                    left: 20,
                    top: 40,
                    width: 2,
                    height: 28,
                    background: index < currentIndex ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.1)',
                    zIndex: 1
                  }}
                />
              )}

              {/* Step Circle Icon */}
              <div 
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: isCurrent 
                    ? 'var(--accent-color)' 
                    : isCompleted 
                      ? 'rgba(255, 87, 34, 0.15)' 
                      : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${isCurrent || isCompleted ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  color: isCurrent || isCompleted ? 'var(--accent-color)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isCurrent ? '0 0 12px var(--accent-glow)' : 'none',
                  zIndex: 2,
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Adjust icon color if current for visibility */}
                <StepIcon size={20} color={isCurrent ? '#fff' : 'currentColor'} />
              </div>

              {/* Description */}
              <div>
                <h4 
                  style={{ 
                    fontSize: 15, 
                    fontWeight: 600, 
                    color: isCurrent ? 'var(--accent-color)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)' 
                  }}
                >
                  {step.label}
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracker;
