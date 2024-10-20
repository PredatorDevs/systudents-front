import React from 'react';
import '../../styles/statCard.css';

const StatCard = ({ icon, title, value, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ color: color }}>
        <i className={icon}></i>
      </div>
      <div className="stat-info">
        <p>{value}</p>
        <h3>{title}</h3>
      </div>
    </div>
  );
};

export default StatCard;
