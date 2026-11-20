import { Request, Response } from 'express';
import { PetRepository } from '../repositories/pet.repository.js';
import { ClientRepository } from '../repositories/client.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';
import { storageService, StorageService } from '../services/storage.service.js';

export class PetController {
  private petRepo: PetRepository;
  private clientRepo: ClientRepository;
  private auditRepo: AuditRepository;
  private storage: StorageService;

  constructor(
    petRepo = new PetRepository(),
    clientRepo = new ClientRepository(),
    auditRepo = new AuditRepository(),
    storage = storageService,
  ) {
    this.petRepo = petRepo;
    this.clientRepo = clientRepo;
    this.auditRepo = auditRepo;
    this.storage = storage;
  }

  list = (req: Request, res: Response) => {
    const { clientId, species } = req.query;
    let pets = this.petRepo.findAll();
    if (clientId && typeof clientId === 'string') {
      pets = pets.filter((p) => p.clientId === clientId);
    }
    if (species && typeof species === 'string') {
      pets = pets.filter((p) => p.species.toLowerCase() === species.toLowerCase());
    }
    res.json(pets);
  };

  getById = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const pet = this.petRepo.findById(id);
    if (!pet) {
      return res.status(404).json({ error: 'Animal paciente não encontrado.' });
    }
    res.json(pet);
  };

  create = (req: Request, res: Response) => {
    const {
      clientId,
      name,
      species,
      breed,
      sex,
      birthDate,
      weightKg,
      fotoUrl,
      alergiasMedicamentos,
      notes,
    } = req.body;

    if (!clientId || !name || !species) {
      return res.status(400).json({ error: 'clientId, name e species são obrigatórios.' });
    }

    const client = this.clientRepo.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Cliente tutor não encontrado.' });
    }

    const created = this.petRepo.create({
      clientId,
      name,
      species,
      breed: breed || 'SRD (Sem Raça Definida)',
      sex,
      birthDate,
      weightKg: weightKg ? Number(weightKg) : undefined,
      fotoUrl,
      alergiasMedicamentos,
      notes,
    });

    this.auditRepo.log({
      action: 'CREATE',
      targetId: created.id,
      targetType: 'PET',
      user: 'Recepção (VetCare)',
      details: `Novo pet cadastrado: ${created.name} (${created.species}) para ${client.name}`,
    });

    res.status(201).json(created);
  };

  update = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const existing = this.petRepo.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Animal paciente não encontrado.' });
    }

    const updated = this.petRepo.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Animal paciente não encontrado.' });
    }

    this.auditRepo.log({
      action: 'UPDATE_STATUS',
      targetId: id,
      targetType: 'PET',
      user: 'Recepção (VetCare)',
      details: `Dados do pet ${updated.name} atualizados.`,
    });

    res.json(updated);
  };

  uploadFoto = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const pet = this.petRepo.findById(id);
    if (!pet) {
      return res.status(404).json({ error: 'Animal paciente não encontrado.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de imagem foi enviado.' });
    }

    try {
      // 1. Remove foto anterior para evitar arquivos órfãos no bucket
      if (pet.fotoUrl) {
        await this.storage.deletePetFoto(pet.fotoUrl);
      }

      // 2. Faz o upload da nova imagem para o bucket `pet-fotos`
      const fotoUrl = await this.storage.uploadPetFoto(
        id,
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
      );

      // 3. Atualiza o registro do pet com a URL da foto
      const updated = this.petRepo.update(id, { fotoUrl });

      this.auditRepo.log({
        action: 'UPDATE_STATUS',
        targetId: id,
        targetType: 'PET',
        user: 'Recepção (VetCare)',
        details: `Foto atualizada para o pet ${pet.name}.`,
      });

      res.json({ message: 'Foto do pet atualizada com sucesso.', fotoUrl, pet: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao processar foto do pet.' });
    }
  };

  delete = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const pet = this.petRepo.findById(id);
    if (!pet) {
      return res.status(404).json({ error: 'Animal paciente não encontrado.' });
    }

    // Remove foto do Storage para não deixar arquivo órfão
    if (pet.fotoUrl) {
      await this.storage.deletePetFoto(pet.fotoUrl);
    }

    this.petRepo.delete(id);
    this.auditRepo.log({
      action: 'CANCEL',
      targetId: id,
      targetType: 'PET',
      user: 'Recepção (VetCare)',
      details: `Pet ${pet.name} excluído do sistema.`,
    });

    res.json({ message: 'Animal removido com sucesso.', id });
  };
}
