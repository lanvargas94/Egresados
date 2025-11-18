package com.corhuila.egresados.infrastructure.catalog;

import com.corhuila.egresados.infrastructure.catalog.repo.CityRepository;
import com.corhuila.egresados.infrastructure.catalog.repo.CountryRepository;
import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import org.springframework.stereotype.Service;

@Service
public class CatalogService {
    private final CountryRepository countries;
    private final CityRepository cities;

    public CatalogService(CountryRepository countries, CityRepository cities) {
        this.countries = countries; this.cities = cities;
    }

    public boolean isValidCountry(String code) {
        if (code == null) return false;
        return countries.existsById(code.toUpperCase());
    }

    public boolean isValidCity(String countryCode, String cityName) {
        if (countryCode == null || cityName == null) return false;
        return cities.findByCountryCodeAndNameIgnoreCase(countryCode.toUpperCase(), cityName.trim()).isPresent();
    }

    public String toE164OrThrow(String rawPhone, String countryCode) {
        if (rawPhone == null || rawPhone.isBlank()) return null;
        PhoneNumberUtil util = PhoneNumberUtil.getInstance();
        try {
            Phonenumber.PhoneNumber num = util.parse(rawPhone, countryCode);
            if (!util.isValidNumber(num)) throw new IllegalArgumentException("Teléfono inválido para el país");
            return util.format(num, PhoneNumberUtil.PhoneNumberFormat.E164);
        } catch (NumberParseException e) {
            throw new IllegalArgumentException("Teléfono inválido (RN-V04)");
        }
    }
}

