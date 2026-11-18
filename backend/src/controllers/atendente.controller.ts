import { Request, Response } from 'express';
import { AtendenteRepository } from '../repositories/atendente.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';

export class AtendenteController {
  private repo: AtendenteRepository;
  private audit: AuditRepository;

  constructor(repo = new AtendenteRepository(), audit = new AuditRepository()) {
    this.repo = repo;
    this.audit = audit;
  }

  list = async (_req: Request, res: Response) => {
    try {
      const atendentes = await this.repo.findAll();
      res.json(atendentes);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao listar atendentes' });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const atendente = await this.repo.findById(id);
      if (!atendente) {
        return res.status(404).json({ error: 'Atendente não encontrado' });
      }
      res.json(atendente);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao buscar atendente' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { nome, email, telefone } = req.body;
      if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' });
      }

      const existing = await this.repo.findByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'Já existe um atendente com este e-mail' });
      }

      const created = await this.repo.create({ nome, email, telefone });
      this.audit.log({
        action: 'CREATE',
        targetId: created.id,
        targetType: 'CLIENT',
        user: 'Administração MedPet',
        details: `Atendente cadastrado: ${created.nome} (${created.email})`,
      });

      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao criar atendente' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const updated = await this.repo.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Atendente não encontrado' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao atualizar atendente' });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const success = await this.repo.delete(id);
      if (!success) {
        return res.status(404).json({ error: 'Atendente não encontrado' });
      }
      res.json({ message: 'Atendente removido com sucesso', id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao excluir atendente' });
    }
  };
}
