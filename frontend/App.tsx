import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.tsx';
import { ProductListingPage } from './pages/ProductListingPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { UserAccountPage } from './pages/UserAccountPage.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/account" element={<UserAccountPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
