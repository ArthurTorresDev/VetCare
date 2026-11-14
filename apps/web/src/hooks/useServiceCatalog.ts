import { useState, useCallback } from 'react';
import { ClinicService } from '@vetcare/shared';
import * as serviceService from '../services/service.service';

export function useServiceCatalog(initialServices: ClinicService[] = []) {
  const [services, setServices] = useState<ClinicService[]>(initialServices);
  const [loading, setLoading] = useState(false);

  const refreshServices = useCallback(async (onlyActive = false) => {
    setLoading(true);
    try {
      const data = await serviceService.fetchServices(onlyActive);
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addService = useCallback(async (data: Partial<ClinicService>) => {
    const created = await serviceService.createService(data);
    setServices((prev) => [...prev, created]);
    return created;
  }, []);

  const toggleServiceActive = useCallback(async (id: string, currentStatus: boolean) => {
    const updated = await serviceService.updateService(id, { isActive: !currentStatus });
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const editService = useCallback(async (id: string, updates: Partial<ClinicService>) => {
    const updated = await serviceService.updateService(id, updates);
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const removeService = useCallback(async (id: string) => {
    await serviceService.deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    services,
    setServices,
    loading,
    refreshServices,
    addService,
    toggleServiceActive,
    editService,
    removeService,
  };
}
