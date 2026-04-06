import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { QuantityService, ConvertRequest, OperationRequest } from '../../core/services/quantity.service';
import { HttpErrorResponse } from '@angular/common/http';

const UNIT_MAP: Record<string, string[]> = {
  Length:      ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
  Weight:      ['KILOGRAM', 'GRAM', 'POUND'],
  Volume:      ['LITRE', 'MILLILITRE', 'GALLON'],
  Temperature: ['CELSIUS', 'FAHRENHEIT', 'KELVIN']
};
const ALL_OPS = ['Convert', 'Add', 'Subtract', 'Compare', 'Divide'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Sidebar mobile toggle
  sidebarOpen = false;

  // User
  displayUsername = 'User';
  avatarLetter = 'U';

  // Dropdowns
  openDropdown: string | null = null;

  measurementType = 'Length';
  operationType   = 'Convert';
  unit1           = 'FEET';
  unit2           = 'FEET';
  targetUnit      = 'FEET';

  availableUnits: string[] = UNIT_MAP['Length'];
  availableOps: string[]   = [...ALL_OPS];

  // Inputs
  val1: number | null = null;
  val2: number | null = null;

  // UI
  showVal2   = false;
  showTarget = true;

  // Result
  resultValue = '0.00';
  resultUnit  = 'Units';
  statusMsg   = 'Ready for calculation';
  statusType: 'default' | 'success' | 'error' = 'default';

  isCalculating = false;

  constructor(
    private auth: AuthService,
    private quantity: QuantityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.displayUsername = this.auth.getUsernameFromToken();
    this.avatarLetter    = this.displayUsername[0]?.toUpperCase() ?? 'U';
    this.initUnits();
    this.initOps();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!(e.target as HTMLElement).closest('.dd-container')) {
      this.openDropdown = null;
    }
  }

  toggleDD(key: string, e: MouseEvent): void {
    e.stopPropagation();
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  selectMeasurementType(v: string): void {
    this.measurementType = v; this.openDropdown = null;
    this.initUnits(); this.initOps();
  }
  selectOperation(v: string): void {
    this.operationType = v; this.openDropdown = null;
    this.applyOperationUI();
  }
  selectUnit1(v: string): void     { this.unit1 = v;       this.openDropdown = null; }
  selectUnit2(v: string): void     { this.unit2 = v;       this.openDropdown = null; }
  selectTarget(v: string): void    { this.targetUnit = v;  this.openDropdown = null; }

  initUnits(): void {
    this.availableUnits = UNIT_MAP[this.measurementType] ?? [];
    const f = this.availableUnits[0] ?? '';
    this.unit1 = this.unit2 = this.targetUnit = f;
  }

  initOps(): void {
    this.availableOps = this.measurementType === 'Temperature'
      ? ['Convert', 'Compare']
      : [...ALL_OPS];
    this.operationType = 'Convert';
    this.applyOperationUI();
  }

  applyOperationUI(): void {
    const op = this.operationType;
    this.showVal2   = op !== 'Convert';
    this.showTarget = op === 'Convert';
  }

  setStatus(msg: string, type: 'default' | 'success' | 'error'): void {
    this.statusMsg  = msg;
    this.statusType = type;
  }

  calculate(): void {
    if (this.val1 === null || isNaN(Number(this.val1))) {
      this.setStatus('Enter value 1', 'error'); this.resultValue = '—'; this.resultUnit = ''; return;
    }
    if (this.showVal2 && (this.val2 === null || isNaN(Number(this.val2)))) {
      this.setStatus('Enter value 2', 'error'); this.resultValue = '—'; this.resultUnit = ''; return;
    }
    this.isCalculating = true;

    const onSuccess = (data: any) => {
      this.isCalculating = false;
      this.resultValue = typeof data.resultValue === 'number'
        ? data.resultValue.toFixed(4) : String(data.resultValue ?? '—');
      this.resultUnit = data.resultUnit ?? '—';
      this.setStatus('✓ Calculation complete', 'success');
    };
    const onError = (err: HttpErrorResponse) => {
      this.isCalculating = false;
      this.setStatus(err.error?.message || 'Calculation failed', 'error');
      this.resultValue = '—'; this.resultUnit = '';
    };

    if (this.operationType === 'Convert') {
      const p: ConvertRequest = { value: Number(this.val1), fromUnit: this.unit1, toUnit: this.targetUnit };
      this.quantity.convert(p).subscribe({ next: onSuccess, error: onError });
    } else {
      const p: OperationRequest = { value1: Number(this.val1), value2: Number(this.val2), unit1: this.unit1, unit2: this.unit2 };
      const map: Record<string, any> = {
        Add:      () => this.quantity.add(p),
        Subtract: () => this.quantity.subtract(p),
        Compare:  () => this.quantity.compare(p),
        Divide:   () => this.quantity.divide(p)
      };
      map[this.operationType]().subscribe({ next: onSuccess, error: onError });
    }
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void  { this.sidebarOpen = false; }

  logout(): void { this.auth.logout(); this.router.navigate(['/']); }
}
