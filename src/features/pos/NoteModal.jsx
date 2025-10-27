import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';

const NoteModal = ({ onClose }) => {
  const { note, setNote } = useAppStore();
  const [currentNote, setCurrentNote] = useState(note);

  const handleSaveNote = () => {
    setNote(currentNote);
    onClose();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Añadir Nota a la Venta</h2>
      <div className="mb-4">
        <label htmlFor="saleNote" className="block text-sm font-medium text-gray-700">Nota</label>
        <textarea
          id="saleNote"
          rows="4"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
        ></textarea>
      </div>
      <Button onClick={handleSaveNote} className="w-full bg-blue-600 text-white py-2 hover:bg-blue-700">
        Guardar Nota
      </Button>
    </div>
  );
};

export default NoteModal;
