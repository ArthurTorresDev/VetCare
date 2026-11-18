import { Request, Response } from 'express';
import { VeterinarioRepository } from '../repositories/veterinario.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';

export class VeterinarioController {
  private repo: VeterinarioRepository;
  private audit: AuditRepository;

  constructor(repo = new VeterinarioRepository(), audit = new AuditRepository()) {
    this.repo = repo;
    this.audit = audit;
  }

  list = async (_req: Request, res: Response) => {
    try {
      const vets = await this.repo.findAll();
      res.json(vets);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao listar veterinários' });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const vet = await this.repo.findById(id);
      if (!vet) {
        return res.status(404).json({ error: 'Veterinário não encontrado' });
      }
      res.json(vet);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao buscar veterinário' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { nome, crmv, telefone, email } = req.body;
      if (!nome || !crmv || !email) {
        return res.status(400).json({ error: 'Nome, CRMV e e-mail são obrigatórios' });
      }

      const existing = await this.repo.findByCrmv(crmv);
      if (existing) {
        return res.status(409).json({ error: 'Já existe um veterinário com este CRMV' });
      }

      const created = await this.repo.create({ nome, crmv, telefone, email });
      this.audit.log({
        action: 'CREATE',
        targetId: created.id,
        targetType: 'CLIENT', // audit categorizado
        user: 'Administração MedPet',
        details: `Veterinário cadastrado: ${created.nome} (CRMV: ${created.crmv})`,
      });

      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao criar veterinário' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const updated = await this.repo.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Veterinário não encontrado' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao atualizar veterinário' });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const success = await this.repo.delete(id);
      if (!success) {
        return res.status(404).json({ error: 'Veterinário não encontrado' });
      }
      res.json({ message: 'Veterinário removido com sucesso', id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao excluir veterinário' });
    }
  };
}
