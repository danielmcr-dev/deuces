import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import HomePage from './pages/HomePage';
import RankingsPage from './pages/RankingsPage';
import CalendarPage from './pages/CalendarPage';
import NewsPage from './pages/NewsPage';
import InjuriesPage from './pages/InjuriesPage';
import MyPlayersPage from './pages/MyPlayersPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="rankings" element={<RankingsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="injuries" element={<InjuriesPage />} />
        <Route path="my-players" element={<MyPlayersPage />} />
        <Route path="players/:id" element={<PlayerProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
