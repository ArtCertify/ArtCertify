import React, { useState } from 'react';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { Button, Card, Input, Select, Modal } from './ui';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Organization Admin' | 'Editor' | 'Guest';
  avatar?: string;
}

interface NewUserForm {
  name: string;
  email: string;
  role: 'Organization Admin' | 'Editor' | 'Guest';
}

export const RolesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    name: '',
    email: '',
    role: 'Guest'
  });

  // Mock data - in real app this would come from API
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Marco Bianchi',
      email: 'marco.bianchi@museo.it',
      role: 'Editor',
      avatar: '👨‍💼'
    },
    {
      id: '2',
      name: 'Laura Verdi',
      email: 'laura.verdi@museo.it',
      role: 'Organization Admin',
      avatar: '👩‍💼'
    },
    {
      id: '3',
      name: 'Giuseppe Neri',
      email: 'giuseppe.neri@museo.it',
      role: 'Guest',
      avatar: '👨'
    },
    {
      id: '4',
      name: 'Elena Rossi',
      email: 'elena.rossi@museo.it',
      role: 'Editor',
      avatar: '👩'
    }
  ]);

  const roleOptions = [
    { value: 'all', label: 'Tutti i ruoli' },
    { value: 'Organization Admin', label: 'Organization Admin' },
    { value: 'Editor', label: 'Editor' },
    { value: 'Guest', label: 'Guest' }
  ];

  const newUserRoleOptions = [
    { value: 'Guest', label: 'Guest' },
    { value: 'Editor', label: 'Editor' },
    { value: 'Organization Admin', label: 'Organization Admin' }
  ];

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, newRole: 'Organization Admin' | 'Editor' | 'Guest') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleAddUser = () => {
    if (newUserForm.name && newUserForm.email) {
      const newUser: User = {
        id: Date.now().toString(),
        name: newUserForm.name,
        email: newUserForm.email,
        role: newUserForm.role,
        avatar: '👤'
      };
      setUsers([...users, newUser]);
      setNewUserForm({ name: '', email: '', role: 'Guest' });
      setShowAddUserModal(false);
    }
  };



  return (
    <ResponsiveLayout title="Gestione Ruoli">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-page-title text-white">Gestione Ruoli</h1>
            <p className="text-slate-400 text-body-regular mt-1">
              Gestisci utenti e permessi dell'organizzazione
            </p>
          </div>
          
          <Button
            onClick={() => setShowAddUserModal(true)}
            icon={<PlusIcon className="h-5 w-5" />}
            variant="primary"
          >
            Aggiungi Utente
          </Button>
        </div>

        {/* Search and Filters */}
        <Card variant="default" padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-label-form text-slate-300 mb-2">
                Ricerca utente
              </label>
              <Input
                type="text"
                placeholder="Cerca per nome o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-label-form text-slate-300 mb-2">
                Filtra per ruolo
              </label>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={roleOptions}
              />
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card variant="default">
          <div className="px-6 py-4 border-b border-slate-700">
            <h3 className="text-subsection-title text-white">
              Utenti dell'organizzazione
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-label-form font-medium text-slate-300">
                    Nome Utente
                  </th>
                  <th className="px-6 py-3 text-left text-label-form font-medium text-slate-300">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-label-form font-medium text-slate-300">
                    Ruolo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-lg">
                          {user.avatar}
                        </div>
                        <span className="text-body-regular font-medium text-white">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-body-regular text-slate-300">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                        options={newUserRoleOptions}
                        className="min-w-[160px]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UserIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-subsection-title text-white mb-2">
                  Nessun utente trovato
                </h3>
                <p className="text-body-regular text-slate-400">
                  {searchTerm || roleFilter !== 'all' 
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Non ci sono ancora utenti nell\'organizzazione'
                  }
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Add User Modal */}
        <Modal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          title="Aggiungi Nuovo Utente"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-label-form text-slate-300 mb-2">
                Nome completo
              </label>
              <Input
                type="text"
                placeholder="Inserisci il nome completo"
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                leftIcon={<UserIcon className="h-4 w-4" />}
              />
            </div>

            <div>
              <label className="block text-label-form text-slate-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="Inserisci l'email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                leftIcon={<EnvelopeIcon className="h-4 w-4" />}
              />
            </div>

            <div>
              <label className="block text-label-form text-slate-300 mb-2">
                Ruolo
              </label>
              <Select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                options={newUserRoleOptions}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowAddUserModal(false)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                variant="primary"
                onClick={handleAddUser}
                disabled={!newUserForm.name || !newUserForm.email}
                className="flex-1"
              >
                Aggiungi Utente
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ResponsiveLayout>
  );
}; 