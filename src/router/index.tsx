
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import Warning from '@/pages/Warning';
import ApprovalTodo from '@/pages/ApprovalTodo';
import ApprovalDone from '@/pages/ApprovalDone';
import Plan from '@/pages/Plan';
import PlanDetail from '@/pages/PlanDetail';
import WeeklyReport from '@/pages/WeeklyReport';
import SystemUsers from '@/pages/SystemUsers';
import Login from '@/pages/Login';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'events', element: <Events /> },
      { path: 'events/:id', element: <EventDetail /> },
      { path: 'warning', element: <Warning /> },
      { path: 'approval/todo', element: <ApprovalTodo /> },
      { path: 'approval/done', element: <ApprovalDone /> },
      { path: 'plan', element: <Plan /> },
      { path: 'plan/:id', element: <PlanDetail /> },
      { path: 'report/weekly', element: <WeeklyReport /> },
      { path: 'system/users', element: <SystemUsers /> },
    ],
  },
]);

export default router;
