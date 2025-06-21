import React, { useState, useEffect, createContext, useContext } from 'react';

// Importações do Material-UI
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, IconButton // Adicionado IconButton para o botão de fechar modal
} from '@mui/material';

// Importações dos Ícones do Material-UI (substituindo lucide-react)
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import HealingIcon from '@mui/icons-material/Healing';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Para "Agendar Nova Consulta"
import DeleteIcon from '@mui/icons-material/Delete'; // Para "Apagar Consulta"
import CloseIcon from '@mui/icons-material/Close'; // Para o botão de fechar o modal


// Contexto para gerir o estado de autenticação e dados do utilizador
const AuthContext = createContext(null);

// Componente principal da aplicação
const App = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [message, setMessage] = useState('');

  const clearMessage = () => {
    setTimeout(() => setMessage(''), 3000);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtToken = urlParams.get('token');

    if (jwtToken) {
      setToken(jwtToken);
      localStorage.setItem('jwtToken', jwtToken);
      window.history.replaceState({}, document.title, window.location.pathname);

      try {
        const decodedUser = JSON.parse(atob(jwtToken.split('.')[1]));
        setUser(decodedUser);
        setMessage('Login bem-sucedido!');
        clearMessage();
      } catch (error) {
        console.error('Erro ao decodificar o token JWT:', error);
        setMessage('Erro ao processar o login.');
        clearMessage();
        setToken(null);
        localStorage.removeItem('jwtToken');
      }
    } else {
      const storedToken = localStorage.getItem('jwtToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          const decodedUser = JSON.parse(atob(storedToken.split('.')[1]));
          setUser(decodedUser);
        } catch (error) {
          console.error('Erro ao decodificar o token JWT do localStorage:', error);
          setToken(null);
          localStorage.removeItem('jwtToken');
        }
      }
    }
  }, []);

  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwtToken');
    setMessage('Logout realizado com sucesso.');
    clearMessage();
    setCurrentPage('home');
  };

  const authContextValue = { token, user, handleLogout, setMessage, clearMessage };

  return (
    <AuthContext.Provider value={authContextValue}>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.100', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" sx={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', padding: 2, boxShadow: 3, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
          <Toolbar sx={{ flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: { xs: 0, sm: 1 }, color: 'white', fontWeight: 'bold', mb: { xs: 2, sm: 0 }, display: 'flex', alignItems: 'center' }}>
              <CalendarMonthIcon sx={{ mr: 1, fontSize: 28 }} />
              Scheduler App
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 1 }}>
              <Button color="inherit" onClick={() => setCurrentPage('home')} startIcon={<HomeIcon />} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Home</Button>
              {token && (
                <>
                  <Button color="inherit" onClick={() => setCurrentPage('appointments')} startIcon={<CalendarMonthIcon />} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Todas as Consultas</Button>
                  <Button color="inherit" onClick={() => setCurrentPage('my-appointments')} startIcon={<PersonIcon />} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Minhas Consultas</Button>
                  <Button color="inherit" onClick={() => setCurrentPage('doctors')} startIcon={<HealingIcon />} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Médicos</Button>
                  <Button color="inherit" onClick={() => setCurrentPage('specialties')} startIcon={<HealingIcon />} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Especialidades</Button>
                </>
              )}
              {token ? (
                <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ backgroundColor: 'error.main', '&:hover': { backgroundColor: 'error.dark' } }}>Logout</Button>
              ) : (
                <Button color="inherit" onClick={handleLogin} startIcon={<LoginIcon />} sx={{ backgroundColor: 'success.main', '&:hover': { backgroundColor: 'success.dark' } }}>Login Google</Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {message && (
          <Box sx={{ position: 'fixed', top: 80, right: 16, backgroundColor: 'info.main', color: 'white', p: 2, borderRadius: 2, boxShadow: 3, zIndex: 50 }}>
            <Typography variant="body1">{message}</Typography>
          </Box>
        )}

        <Container sx={{ mt: 4, flexGrow: 1, padding: 3 }}>
          {user && (
            <Box sx={{ backgroundColor: 'blue.100', color: 'blue.800', p: 2, borderRadius: 2, boxShadow: 2, mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" component="span">
                Bem-vindo, <Typography component="span" variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>{user.name}</Typography>! (Role: <Typography component="span" variant="h6" color="secondary.main" sx={{ fontWeight: 'bold' }}>{user.role}</Typography>)
              </Typography>
            </Box>
          )}

          {currentPage === 'home' && <HomePage />}
          {currentPage === 'appointments' && token && <AppointmentsPage />}
          {currentPage === 'my-appointments' && token && <MyAppointmentsPage />}
          {currentPage === 'doctors' && token && <DoctorsPage />}
          {currentPage === 'specialties' && token && <SpecialtiesPage />}
          {!token && currentPage !== 'home' && (
            <Box sx={{ p: 3, mt: 4, textAlign: 'center', backgroundColor: 'error.50', color: 'error.dark', borderRadius: 2, boxShadow: 2 }}>
              <Typography variant="h5" color="error" sx={{ fontWeight: 'bold', mb: 2 }}>Acesso Negado</Typography>
              <Typography variant="body1">Por favor, faça login para aceder a esta funcionalidade.</Typography>
            </Box>
          )}
        </Container>

        <Box sx={{ backgroundColor: 'grey.800', color: 'white', p: 2, textAlign: 'center', borderTopLeftRadius: 8, borderTopRightRadius: 8, boxShadow: '0px -2px 4px rgba(0,0,0,0.2)' }}>
          <Typography variant="body2">&copy; 2025 Scheduler App. Todos os direitos reservados.</Typography>
        </Box>
      </Box>
    </AuthContext.Provider>
  );
};

// Componente da Página Inicial
const HomePage = () => (
  <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3, textAlign: 'center' }}>
    <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'grey.800' }}>Bem-vindo ao Scheduler App!</Typography>
    <Typography variant="body1" paragraph sx={{ color: 'grey.600' }}>
      A sua plataforma completa para gerir agendamentos de consultas médicas.
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, backgroundColor: 'blue.50', borderRadius: 2, boxShadow: 2, width: { xs: '100%', sm: '33.333%' } }}>
        <CalendarMonthIcon sx={{ color: 'blue.600', mb: 1, fontSize: 48 }} />
        <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'grey.700', mb: 1 }}>Agende Consultas</Typography>
        <Typography variant="body2" sx={{ color: 'grey.500' }}>Marque e visualize as suas consultas de forma fácil e rápida.</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, backgroundColor: 'green.50', borderRadius: 2, boxShadow: 2, width: { xs: '100%', sm: '33.333%' } }}>
        <HealingIcon sx={{ color: 'green.600', mb: 1, fontSize: 48 }} />
        <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'grey.700', mb: 1 }}>Conheça os Médicos</Typography>
        <Typography variant="body2" sx={{ color: 'grey.500' }}>Explore a lista de médicos disponíveis e suas especialidades.</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, backgroundColor: 'purple.50', borderRadius: 2, boxShadow: 2, width: { xs: '100%', sm: '33.333%' } }}>
        <HomeIcon sx={{ color: 'purple.600', mb: 1, fontSize: 48 }} /> {/* Usando HomeIcon como um placeholder para BriefcaseMedical */}
        <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'grey.700', mb: 1 }}>Especialidades</Typography>
        <Typography variant="body2" sx={{ color: 'grey.500' }}>Descubra as diversas especialidades médicas oferecidas.</Typography>
      </Box>
    </Box>
    <Typography variant="body1" sx={{ mt: 3, color: 'grey.700' }}>
      Faça login para começar a gerir os seus agendamentos!
    </Typography>
  </Box>
);

// Componente para exibir a lista de Consultas
const AppointmentsPage = () => {
  const { token, setMessage, clearMessage } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchAppointments = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar consultas.');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
      setMessage(`Erro: ${err.message}`);
      clearMessage();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const handleAppointmentCreated = () => {
    setShowCreateModal(false);
    fetchAppointments();
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" sx={{ textAlign: 'center' }}>Erro: {error}</Typography>;

  return (
    <Box sx={{ backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'grey.800' }}>Todas as Consultas</Typography>
        <Button variant="contained" onClick={() => setShowCreateModal(true)} startIcon={<AddCircleOutlineIcon />}>
          Agendar Nova Consulta
        </Button>
      </Box>

      {appointments.length === 0 ? (
        <Typography sx={{ textAlign: 'center', color: 'grey.600' }}>Nenhuma consulta encontrada.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
          {appointments.map(appointment => (
            <Box key={appointment.id} sx={{ p: 2, borderRadius: 2, boxShadow: 1, border: '1px solid', borderColor: 'blue.200', backgroundColor: 'blue.50' }}>
              <Typography variant="body1" sx={{ fontWeight: 'semibold', color: 'blue.800' }}>Data: {appointment.date}</Typography>
              <Typography variant="body1" sx={{ color: 'grey.700' }}>Hora: {appointment.time}</Typography>
              <Typography variant="body1" sx={{ color: 'grey.700' }}>Notas: {appointment.notes || 'N/A'}</Typography>
              <Typography variant="body1" sx={{ color: 'grey.700' }}>Utilizador: {appointment.User ? appointment.User.name : 'Desconhecido'}</Typography>
              <Typography variant="body1" sx={{ color: 'grey.700' }}>Médico: {appointment.Doctor ? appointment.Doctor.name : 'Desconhecido'}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {showCreateModal && (
        <CreateAppointmentForm
          onClose={() => setShowCreateModal(false)}
          onAppointmentCreated={handleAppointmentCreated}
        />
      )}
    </Box>
  );
};

// Componente para exibir as Consultas do Utilizador Logado
const MyAppointmentsPage = () => {
  const { token, user, setMessage, clearMessage } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const fetchMyAppointments = async () => {
    if (!token || !user) {
      setMessage('Erro: Utilizador não autenticado para ver as suas consultas.');
      clearMessage();
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/users/${user.id}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar as suas consultas.');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
      setMessage(`Erro: ${err.message}`);
      clearMessage();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAppointments();
  }, [token, user]);

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/appointments/${appointmentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao apagar a consulta.');
      }

      setAppointments(prev => prev.filter(app => app.id !== appointmentToDelete.id));
      setMessage('Consulta apagada com sucesso!');
      clearMessage();
    } catch (err) {
      setMessage(`Erro ao apagar: ${err.message}`);
      clearMessage();
    } finally {
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAppointmentToDelete(null);
  };


  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" sx={{ textAlign: 'center' }}>Erro: {error}</Typography>;

  return (
    <Box sx={{ backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'grey.800', textAlign: 'center' }}>Minhas Consultas</Typography>
      {appointments.length === 0 ? (
        <Typography sx={{ textAlign: 'center', color: 'grey.600' }}>Nenhuma consulta encontrada para o seu utilizador.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
          {appointments.map(appointment => (
            <Box key={appointment.id} sx={{ p: 2, borderRadius: 2, boxShadow: 1, border: '1px solid', borderColor: 'success.200', backgroundColor: 'success.50' }}>
              <Typography variant="body1" sx={{ fontWeight: 'semibold', color: 'success.800' }}>Data: {appointment.date}</Typography>
              <Typography variant="body1" sx={{ color: 'grey.700' }}>Hora: {appointment.time}</Typography>
              <Typography variant="body1" sx={{ color: 'grey.700' }}>Notas: {appointment.notes || 'N/A'}</Typography>
              <Typography variant="body1" sx={{ color: 'grey.700' }}>Médico: {appointment.Doctor ? appointment.Doctor.name : 'Desconhecido'}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                {/* Botão de Editar Consulta (comentado) */}
                {/* <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                  Editar
                </Button> */}
                <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteClick(appointment)} startIcon={<DeleteIcon />}>
                  Apagar
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={showDeleteModal} onClose={cancelDelete}>
        <DialogTitle>Confirmar Eliminação</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja apagar a consulta em {appointmentToDelete?.date} às {appointmentToDelete?.time}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>Sim, Apagar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Componente para exibir a lista de Médicos
const DoctorsPage = () => {
  const { token, setMessage, clearMessage } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/doctors', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao buscar médicos.');
        }
        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        setError(err.message);
        setMessage(`Erro: ${err.message}`);
        clearMessage();
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [token]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" sx={{ textAlign: 'center' }}>Erro: {error}</Typography>;

  return (
    <Box sx={{ backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'grey.800', textAlign: 'center' }}>Nossos Médicos</Typography>
      {doctors.length === 0 ? (
        <Typography sx={{ textAlign: 'center', color: 'grey.600' }}>Nenhum médico encontrado.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
          {doctors.map(doctor => (
            <Box key={doctor.id} sx={{ p: 2, borderRadius: 2, boxShadow: 1, border: '1px solid', borderColor: 'primary.200', backgroundColor: 'primary.50' }}>
              <Typography variant="body1" sx={{ fontWeight: 'semibold', color: 'primary.800' }}>Nome: {doctor.name}</Typography>
              <Typography variant="body1" sx={{ color: 'grey.700' }}>Especialidade: {doctor.specialty ? doctor.specialty.name : 'N/A'}</Typography> {/* CORRIGIDO AQUI */}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Componente para exibir a lista de Especialidades
const SpecialtiesPage = () => {
  const { token, setMessage, clearMessage } = useContext(AuthContext);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpecialties = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/specialties', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao buscar especialidades.');
        }
        const data = await response.json();
        setSpecialties(data);
      } catch (err) {
        setError(err.message);
        setMessage(`Erro: ${err.message}`);
        clearMessage();
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialties();
  }, [token]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" sx={{ textAlign: 'center' }}>Erro: {error}</Typography>;

  return (
    <Box sx={{ backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'grey.800', textAlign: 'center' }}>Especialidades Médicas</Typography>
      {specialties.length === 0 ? (
        <Typography sx={{ textAlign: 'center', color: 'grey.600' }}>Nenhuma especialidade encontrada.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
          {specialties.map(specialty => (
            <Box key={specialty.id} sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 1, border: '1px solid', borderColor: 'info.200', backgroundColor: 'info.50' }}>
              <Typography variant="body1" sx={{ fontWeight: 'semibold', color: 'info.800' }}>Nome: {specialty.name}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Componente: Formulário para Criar Nova Consulta
const CreateAppointmentForm = ({ onClose, onAppointmentCreated }) => {
  const { token, user, setMessage, clearMessage } = useContext(AuthContext);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [formLoading, setFormLoading] = useState(true);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!token) {
        setFormError('Não autenticado.');
        setFormLoading(false);
        return;
      }
      try {
        const doctorsResponse = await fetch('http://localhost:3000/api/doctors', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const doctorsData = await doctorsResponse.json();
        setDoctors(doctorsData);

        const specialtiesResponse = await fetch('http://localhost:3000/api/specialties', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const specialtiesData = await specialtiesResponse.json();
        setSpecialties(specialtiesData);

      } catch (err) {
        setFormError(`Erro ao carregar dados: ${err.message}`);
        setMessage(`Erro ao carregar dados para o formulário: ${err.message}`);
        clearMessage();
      } finally {
        setFormLoading(false);
      }
    };
    fetchFormData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    if (!user || !user.id) {
      setMessage('Erro: ID do utilizador não disponível para agendar consulta.');
      clearMessage();
      setFormLoading(false);
      return;
    }

    const newAppointment = {
      user_id: user.id,
      doctorId: parseInt(selectedDoctor),
      specialtyId: parseInt(selectedSpecialty),
      date,
      time,
      notes
    };


    console.log('A enviar nova consulta:', newAppointment);

    try {
      const response = await fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAppointment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao agendar consulta.');
      }

      setMessage('Consulta agendada com sucesso!');
      clearMessage();
      onAppointmentCreated();
    } catch (err) {
      setFormError(err.message);
      setMessage(`Erro ao agendar: ${err.message}`);
      clearMessage();
    } finally {
      setFormLoading(false);
    }
  };

  const filteredDoctors = selectedSpecialty
    ? doctors.filter(doctor => doctor.specialty && doctor.specialty.id === parseInt(selectedSpecialty))
    : doctors;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Agendar Nova Consulta</DialogTitle>
      <DialogContent dividers>
        {formLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
        {formError && <Typography color="error" sx={{ mb: 2 }}>Erro: {formError}</Typography>}

        {!formLoading && (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Data"
              type="date"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Hora"
              type="time"
              fullWidth
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="specialty-label">Especialidade</InputLabel>
              <Select
                labelId="specialty-label"
                id="specialty"
                value={selectedSpecialty}
                label="Especialidade"
                onChange={(e) => {
                  setSelectedSpecialty(e.target.value);
                  setSelectedDoctor('');
                }}
                required
              >
                <MenuItem value="">Selecione uma Especialidade</MenuItem>
                {specialties.map(spec => (
                  <MenuItem key={spec.id} value={spec.id}>{spec.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="doctor-label">Médico</InputLabel>
              <Select
                labelId="doctor-label"
                id="doctor"
                value={selectedDoctor}
                label="Médico"
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
                disabled={!selectedSpecialty || filteredDoctors.length === 0}
              >
                <MenuItem value="">Selecione um Médico</MenuItem>
                {filteredDoctors.map(doc => (
                  <MenuItem key={doc.id} value={doc.id}>{doc.name}</MenuItem>
                ))}
              </Select>
              {!selectedSpecialty && <Typography variant="caption" color="error">Por favor, selecione uma especialidade primeiro.</Typography>}
              {selectedSpecialty && filteredDoctors.length === 0 && <Typography variant="caption" color="error">Não há médicos disponíveis para esta especialidade.</Typography>}
            </FormControl>
            <TextField
              label="Notas (Opcional)"
              multiline
              rows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mb: 2 }}
            />
            <DialogActions>
              <Button onClick={onClose} variant="outlined">Cancelar</Button>
              <Button type="submit" variant="contained" disabled={formLoading}>
                {formLoading ? <CircularProgress size={24} /> : 'Agendar Consulta'}
              </Button>
            </DialogActions>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default App;
