import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { Plant, Category, Article, FAQ, ContactMessage, UserProfile, AuditLog } from './types';
import { Header, NavigationPage } from './components/Header';
import { Footer } from './components/Footer';
import { LeafCursor } from './components/LeafCursor';
import { SiteAudio } from './components/SiteAudio';
import { SproutMascot } from './components/SproutMascot';
import { PlantDetailModal } from './components/PlantDetailModal';
import { DisclaimerModal } from './components/DisclaimerModal';
import { AuthModal } from './pages/AuthModal';

import { HomePage } from './pages/HomePage';
import { DatabasePage } from './pages/DatabasePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { BeliefsPage } from './pages/BeliefsPage';
import { QuizPage } from './pages/QuizPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { HistoryPage } from './pages/HistoryPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { HelpPage } from './pages/HelpPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile>(store.getUser());
  const [plants, setPlants] = useState<Plant[]>(store.getPlants());
  const [categories, setCategories] = useState<Category[]>(store.getCategories());
  const [articles, setArticles] = useState<Article[]>(store.getArticles());
  const [faqs, setFaqs] = useState<FAQ[]>(store.getFaqs());
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(store.getContactMessages());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(store.getAuditLogs());

  // Deep detail modal state
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  // Search and routing parameter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedBeliefId, setSelectedBeliefId] = useState('');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [disclaimerModalOpen, setDisclaimerModalOpen] = useState(false);

  // Subscribe to central store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const updatedUser = store.getUser();
      setCurrentUser(updatedUser);
      if (updatedUser.role === 'guest') setCurrentPage('home');
      setPlants(store.getPlants());
      setCategories(store.getCategories());
      setArticles(store.getArticles());
      setFaqs(store.getFaqs());
      setContactMessages(store.getContactMessages());
      setAuditLogs(store.getAuditLogs());
    });
    return () => unsubscribe();
  }, []);

  // Check URL query parameters on initial load (e.g. ?plant=A01)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plantIdParam = params.get('plant');
    if (plantIdParam) {
      const match = store.getPlantById(plantIdParam);
      if (match) {
        setSelectedPlant(match);
      }
    }
  }, []);

  const handleNavigate = (page: NavigationPage) => {
    // Public pages are available to everyone. Quiz and favorites require a Firebase account.
    if (currentUser.role === 'guest' && (page === 'quiz' || page === 'favorites' || page === 'profile')) {
      setAuthModalOpen(true);
      return;
    }
    if (page === 'admin' && currentUser.role !== 'admin') {
      setAuthModalOpen(true);
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (plantId: string) => {
    if (currentUser.role === 'guest') { setAuthModalOpen(true); return; }
    store.toggleFavorite(plantId);
  };

  const handleSelectPlant = (plant: Plant) => {
    setSelectedPlant(plant);
    store.recordPlantView(plant.plantId);
  };

  const handleSearchFromHome = (query: string) => {
    setSearchQuery(query);
    setCurrentPage('database');
  };

  const handleCategoryFromHome = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage('categories');
  };

  const handleBeliefFromHome = (beliefId: string) => {
    setSelectedBeliefId(beliefId);
    setCurrentPage('beliefs');
  };

  return (
    <div data-user-role={currentUser.role} className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#292B29] selection:bg-[#C6A96B]/30 selection:text-[#183D2B]">
      {/* Custom Leaf Sparkle Cursor */}
      <LeafCursor />
      <SiteAudio page={currentPage} />

      {/* Header with Top Bar Contract */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={() => store.logout()}
        favoritesCount={currentUser.favorites?.length || 0}
      />

      {/* Main Dynamic Page Views */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            featuredPlants={plants.filter((p) => p.isFeatured)}
            recentPlants={plants}
            categories={categories}
            articles={articles}
            favorites={currentUser.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onSelectPlant={handleSelectPlant}
            onSearchQuery={handleSearchFromHome}
            onSelectCategory={handleCategoryFromHome}
            onSelectBelief={handleBeliefFromHome}
            isMember={currentUser.role !== 'guest'}
          />
        )}

        {currentPage === 'database' && (
          <DatabasePage
            plants={plants}
            categories={categories}
            favorites={currentUser.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onSelectPlant={handleSelectPlant}
            initialSearchQuery={searchQuery}
            initialCategory={selectedCategoryId}
            initialBelief={selectedBeliefId}
            canExport={currentUser.role !== 'guest'}
          />
        )}

        {currentPage === 'categories' && (
          <CategoriesPage
            categories={categories}
            plants={plants}
            favorites={currentUser.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onSelectPlant={handleSelectPlant}
            initialCategoryId={selectedCategoryId}
          />
        )}

        {currentPage === 'beliefs' && (
          <BeliefsPage
            plants={plants}
            favorites={currentUser.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onSelectPlant={handleSelectPlant}
            initialBeliefId={selectedBeliefId}
          />
        )}

        {currentPage === 'quiz' && (
          <QuizPage
            plants={plants}
            favorites={currentUser.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onSelectPlant={handleSelectPlant}
            currentUser={currentUser}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentPage === 'history' && (
          <HistoryPage
            plants={plants}
            currentUser={currentUser}
            onToggleFavorite={handleToggleFavorite}
            onSelectPlant={handleSelectPlant}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentPage === 'favorites' && (
          <FavoritesPage
            plants={plants}
            favorites={currentUser.favorites || []}
            currentUser={currentUser}
            onToggleFavorite={handleToggleFavorite}
            onSelectPlant={handleSelectPlant}
            onNavigateToDatabase={() => handleNavigate('database')}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentPage === 'articles' && (
          <ArticlesPage articles={articles} />
        )}

        {currentPage === 'help' && (
          <HelpPage faqs={faqs} onNavigate={handleNavigate} />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'contact' && (
          <ContactPage currentUser={currentUser} />
        )}

        {currentPage === 'profile' && currentUser.role !== 'guest' && (
          <ProfilePage currentUser={currentUser} />
        )}

        {currentPage === 'admin' && (
          <AdminPage
            plants={plants}
            categories={categories}
            articles={articles}
            faqs={faqs}
            contactMessages={contactMessages}
            auditLogs={auditLogs}
            currentUser={currentUser}
            onSelectPlant={handleSelectPlant}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Interactive Mascot "น้องต้นกล้า" */}
      <SproutMascot onNavigateToQuiz={() => handleNavigate('quiz')} plants={plants} faqs={faqs} currentUser={currentUser} onNavigate={handleNavigate} />

      {/* Deep Botanical Detail Modal */}
      <PlantDetailModal
        plant={selectedPlant}
        onClose={() => setSelectedPlant(null)}
        isFavorite={selectedPlant ? (currentUser.favorites || []).includes(selectedPlant.plantId) : false}
        onToggleFavorite={handleToggleFavorite}
        onSelectPlant={handleSelectPlant}
        allPlants={plants}
        canFavorite={true}
        currentUser={currentUser}
        onRequireLogin={() => setAuthModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => { setCurrentUser(user); if (user.role === 'admin') setCurrentPage('admin'); }}
      />

      {/* Disclaimer / Policies Modal */}
      <DisclaimerModal
        isOpen={disclaimerModalOpen}
        onClose={() => setDisclaimerModalOpen(false)}
      />

      {/* Institutional Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenDisclaimer={() => setDisclaimerModalOpen(true)}
      />
    </div>
  );
}
