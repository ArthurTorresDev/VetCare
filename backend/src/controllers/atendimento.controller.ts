import { Request, Response } from 'express';
import { AtendimentoRepository } from '../repositories/atendimento.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';

export class AtendimentoController {
  private repo: AtendimentoRepository;
  private audit: AuditRepository;

  constructor(repo = new AtendimentoRepository(), audit = new AuditRepository()) {
    this.repo = repo;
    this.audit = audit;
  }

  list = async (req: Request, res: Response) => {
    try {
      const { petId } = req.query;
      const list = petId ? await this.repo.findByPetId(String(petId)) : await this.repo.findAll();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao listar atendimentos' });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const item = await this.repo.findById(id);
      if (!item) {
        return res.status(404).json({ error: 'Atendimento não encontrado' });
      }
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao buscar atendimento' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { petId, veterinarioId, atendenteId, tipoServico, dataHora, status, observacoes } = req.body;
      if (!petId || !veterinarioId || !atendenteId || !tipoServico || !dataHora) {
        return res.status(400).json({
          error: 'petId, veterinarioId, atendenteId, tipoServico e dataHora são obrigatórios',
        });
      }

      const created = await this.repo.create({
        petId,
        veterinarioId,
        atendenteId,
        tipoServico,
        dataHora,
        status: status || 'Agendado',
        observacoes,
      });

      this.audit.log({
        action: 'CREATE',
        targetId: created.id,
        targetType: 'APPOINTMENT',
        user: 'Recepção MedPet',
        details: `Atendimento registrado para pet ${created.petId} (${created.tipoServico})`,
      });

      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao registrar atendimento' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const updated = await this.repo.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Atendimento não encontrado' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao atualizar atendimento' });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const success = await this.repo.delete(id);
      if (!success) {
        return res.status(404).json({ error: 'Atendimento não encontrado' });
      }
      res.json({ message: 'Atendimento removido com sucesso', id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao cancelar atendimento' });
    }
  };
}
