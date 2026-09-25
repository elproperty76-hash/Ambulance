import React from 'react';
import { DriverMaster, RelawanMaster, CallCenterContact } from '../types';
import { HOSPITAL_LIST } from '../data/mockData';
import {
  X,
  Phone,
  PhoneCall,
  Ambulance,
  MapPin,
  Plus,
  Edit2,
  Shield,
  Clock,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

interface EmergencyHotlineModalProps {
  drivers?: DriverMaster[];
  relawan?: RelawanMaster[];
  callCenters?: CallCenterContact[];
  onClose: () => void;
  onQuickCall: (phone: string, name: string) => void;
  onOpenAddCallCenter?: () => void;
  onOpenEditCallCenter?: (contact: CallCenterContact) => void;
}

export const EmergencyHotlineModal: React.FC<EmergencyHotlineModalProps> = ({
  drivers = [],
  relawan = [],
  callCenters = [],
  onClose,
  onQuickCall,
  onOpenAddCallCenter,
  onOpenEditCallCenter,
}) => {
  const safeCallCenters = Array.isArray(callCenters) ? callCenters : [];
  const safeDrivers = Array.isArray(drivers) ? drivers : [];
  // Find primary call center or first one
  const primaryCallCenter =
    safeCallCenters.find((c) => c.isUtama) || safeCallCenters[0];
  const otherCallCenters = safeCallCenters.filter(
    (c) => c.id !== primaryCallCenter?.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-red-300 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="p-3 border-b border-red-100 bg-red-50 flex items-center justify-between sticky top-0 backdrop-blur-xs z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-red-950">
                HOTLINE & CALL CENTER DARURAT 24 JAM
              </h3>
              <p className="text-[10px] text-red-700">
                Divisi Ambulance FKW Bumi Pesona Asri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white hover:bg-red-100 text-slate-500 hover:text-red-700 border border-red-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3 space-y-3.5 text-xs">
          {/* Main Call Center Box (Call Center Utama) */}
          <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl p-3.5 shadow-md relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center space-x-1 bg-white/20 text-white text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full tracking-wider mb-1">
                  <Shield className="w-3 h-3 text-amber-300 mr-0.5" />
                  CALL CENTER UTAMA (POSKO 24 JAM)
                </span>
                <h4 className="text-sm font-extrabold tracking-tight mt-0.5">
                  {primaryCallCenter?.nama || 'Posko Siaga FKW-BPA'}
                </h4>
                <p className="text-[11px] text-red-100 font-medium">
                  {primaryCallCenter?.jabatan || 'Koordinator Operasional'}
                </p>
                <p className="text-base font-black font-mono tracking-wider text-amber-200 mt-1">
                  {primaryCallCenter?.noHp || '0812-2345-6789'}
                </p>
                {primaryCallCenter?.catatan && (
                  <p className="text-[10px] text-red-100/90 mt-0.5 italic">
                    {primaryCallCenter.catatan}
                  </p>
                )}
              </div>

              {primaryCallCenter && (
                <button
                  onClick={() => onOpenEditCallCenter(primaryCallCenter)}
                  className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
                  title="Ubah Nama & Nomor Call Center Utama"
                >
                  <Edit2 className="w-3 h-3" />
                  <span className="text-[9px] font-semibold">Ubah</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <a
                href={`tel:${(primaryCallCenter?.noHp || '081223456789').replace(/[^0-9]/g, '')}`}
                className="inline-flex items-center justify-center space-x-1.5 bg-white hover:bg-red-50 text-red-700 font-bold px-3 py-2 rounded-lg text-xs shadow-xs cursor-pointer transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-red-600" />
                <span>Telepon Sekarang</span>
              </a>
              <a
                href={`https://wa.me/${(primaryCallCenter?.noHp || '081223456789').replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=Halo%20Posko%20Ambulance%20FKW%20BPA,%20kami%20membutuhkan%20layanan%20ambulance%20darurat`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-lg text-xs shadow-xs cursor-pointer transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Additional Call Centers / Dispatchers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase text-[10px] flex items-center">
                <PhoneCall className="w-3 h-3 text-red-600 mr-1" />
                Daftar Kontak Call Center & Posko
              </h4>
              {onOpenAddCallCenter && (
                <button
                  type="button"
                  onClick={onOpenAddCallCenter}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Tambah Nomor</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {otherCallCenters.map((cc) => (
                <div
                  key={cc.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <p className="font-bold text-slate-900 text-xs">
                        {cc.nama}
                      </p>
                      {cc.tersedia24Jam && (
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                          24 JAM
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600">{cc.jabatan}</p>
                    <p className="text-[10px] text-red-700 font-mono font-bold">
                      {cc.noHp}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {onOpenEditCallCenter && (
                      <button
                        onClick={() => onOpenEditCallCenter(cc)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 cursor-pointer"
                        title="Edit Kontak"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                    <a
                      href={`tel:${cc.noHp.replace(/[^0-9]/g, '')}`}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md flex items-center space-x-1 font-semibold text-[10px] shadow-xs cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Hubungi</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* List of Drivers On-Call */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] flex items-center justify-between">
              <span className="flex items-center">
                <Ambulance className="w-3 h-3 text-emerald-600 mr-1" />
                Sopir Siaga On-Call BPA
              </span>
              <span className="text-[9px] text-slate-500 font-normal">
                {safeDrivers.filter((d) => d.status === 'siaga').length} Siaga
              </span>
            </h4>

            {safeDrivers.slice(0, 3).map((drv) => (
              <div
                key={drv.id}
                className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200"
              >
                <div>
                  <p className="font-bold text-slate-900 text-xs">{drv.nama}</p>
                  <p className="text-[9px] text-slate-500">{drv.alamatBpa}</p>
                </div>
                <a
                  href={`tel:${drv.noHp.replace(/[^0-9]/g, '')}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md flex items-center space-x-1 font-semibold text-[10px] shadow-xs cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  <span>Panggil</span>
                </a>
              </div>
            ))}
          </div>

          {/* List of Nearby Emergency Hospital Numbers */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] flex items-center">
              <MapPin className="w-3 h-3 text-blue-600 mr-1" />
              Telepon UGD RS Terdekat
            </h4>

            {HOSPITAL_LIST.slice(0, 3).map((hosp) => (
              <div
                key={hosp.id}
                className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200"
              >
                <div>
                  <p className="font-bold text-slate-900 text-xs">{hosp.nama}</p>
                  <p className="text-[10px] text-amber-800 font-mono font-medium">
                    {hosp.teleponUgd} ({hosp.jarakKm} KM)
                  </p>
                </div>
                <a
                  href={`tel:${hosp.teleponUgd.replace(/[^0-9]/g, '')}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-md flex items-center space-x-1 font-semibold text-[10px] shadow-xs cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  <span>IGD</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
