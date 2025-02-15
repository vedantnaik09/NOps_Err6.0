"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import citiesData from '@/data/cities.json';

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  name: HTMLInputElement;
  userType: HTMLSelectElement;
  phoneNumber: HTMLInputElement;
  address: HTMLInputElement;
  state?: HTMLSelectElement;
  city?: HTMLSelectElement;
  pincode?: HTMLInputElement;
  department?: HTMLInputElement;
}

interface SignUpFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>("client");
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const { push } = useRouter();

  useEffect(() => {
    const uniqueStates = Array.from(new Set(citiesData.map((city: { state_name: string }) => city.state_name)));
    setStates(uniqueStates);
  }, []);
  
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const filteredCities = citiesData
      .filter((city: { state_name: string }) => city.state_name === state)
      .map((city: { name: string }) => city.name);
    setCities(filteredCities);
  };

  async function onSubmit(event: React.FormEvent<SignUpFormElement>) {
    event.preventDefault();
    setIsLoading(true);
  
    const { 
      email, password, name, userType, phoneNumber, address,
      state, city, pincode, department 
    } = event.currentTarget.elements;
  
    const userTypeValue = userType.value;
    const route = userTypeValue === 'client' 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/register`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/api/authority/register`;
  
    const baseBody = {
      email: email.value,
      password: password.value,
      name: name.value,
      phoneNumber: phoneNumber?.value,
      address: address.value,
    };
  
    const body = userTypeValue === 'authority' 
      ? {
          ...baseBody,
          department: department?.value,
          state: state?.value,
          city: city?.value,
          pincode: pincode?.value,
        }
      : baseBody;
  
    try {
      const response = await fetch(route, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', userTypeValue);
        push('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" placeholder="John Doe" type="text" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" placeholder="name@example.com" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" name="phoneNumber" placeholder="1234567890" type="tel" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" placeholder="123 Main Street, City" type="text" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="userType">User Type</Label>
          <Select name="userType" required onValueChange={(value) => setUserType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="authority">Authority</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {userType === "authority" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select name="state" required onValueChange={handleStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select name="city" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" name="pincode" placeholder="Pincode" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" placeholder="Department" type="text" required />
            </div>
          </>
        )}
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </div>
  );
}