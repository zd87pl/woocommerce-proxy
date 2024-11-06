import React, { useEffect, useState, ChangeEvent } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { Route } from './types';
import { RouteService } from './services/api';

function App() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Partial<Route>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RouteService.getRoutes();
      setRoutes(data);
    } catch (error) {
      setError('Failed to fetch routes. Please try again later.');
      console.error('Failed to fetch routes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleToggleRoute = async (route: Route) => {
    try {
      setError(null);
      await RouteService.updateRoute(route._id!, {
        isEnabled: !route.isEnabled,
      });
      fetchRoutes();
    } catch (error) {
      setError('Failed to toggle route status.');
      console.error('Failed to toggle route:', error);
    }
  };

  const handleSaveRoute = async () => {
    try {
      setError(null);
      if (currentRoute._id) {
        await RouteService.updateRoute(currentRoute._id, currentRoute);
      } else {
        await RouteService.createRoute(currentRoute as Omit<Route, '_id'>);
      }
      setOpenDialog(false);
      setCurrentRoute({});
      fetchRoutes();
    } catch (error) {
      setError('Failed to save route.');
      console.error('Failed to save route:', error);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    try {
      setError(null);
      await RouteService.deleteRoute(id);
      fetchRoutes();
    } catch (error) {
      setError('Failed to delete route.');
      console.error('Failed to delete route:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          WooCommerce API Proxy Manager
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setCurrentRoute({});
            setOpenDialog(true);
          }}
        >
          Add New Route
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading routes...</Typography>
      ) : routes.length === 0 ? (
        <Typography>No routes found. Add a new route to get started.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Path</TableCell>
                <TableCell>Target URL</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Enabled</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route._id}>
                  <TableCell>{route.path}</TableCell>
                  <TableCell>{route.targetUrl}</TableCell>
                  <TableCell>{route.description}</TableCell>
                  <TableCell>
                    <Switch
                      checked={route.isEnabled}
                      onChange={() => handleToggleRoute(route)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => {
                        setCurrentRoute(route);
                        setOpenDialog(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteRoute(route._id!)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {currentRoute._id ? 'Edit Route' : 'Add New Route'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Path"
            value={currentRoute.path || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCurrentRoute({ ...currentRoute, path: e.target.value })
            }
            margin="normal"
            helperText="Example: /v1/products"
          />
          <TextField
            fullWidth
            label="Target URL"
            value={currentRoute.targetUrl || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCurrentRoute({ ...currentRoute, targetUrl: e.target.value })
            }
            margin="normal"
            helperText="Example: http://internal-api.local/products"
          />
          <TextField
            fullWidth
            label="Description"
            value={currentRoute.description || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCurrentRoute({ ...currentRoute, description: e.target.value })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRoute} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
