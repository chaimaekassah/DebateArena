package debatearena.backend.Integration;

import org.hibernate.boot.model.TypeContributions;
import org.hibernate.dialect.H2Dialect;
import org.hibernate.service.ServiceRegistry;
import org.hibernate.type.SqlTypes;
import org.hibernate.type.descriptor.jdbc.VarcharJdbcType;

public class CustomH2Dialect extends H2Dialect {

    public CustomH2Dialect() {
        super();
    }

    @Override
    public void contributeTypes(TypeContributions typeContributions, ServiceRegistry serviceRegistry) {
        super.contributeTypes(typeContributions, serviceRegistry);
        // Solution magique pour l'erreur 6001 (NAMED_ENUM)
        typeContributions.contributeJdbcType(new VarcharJdbcType() {
            @Override
            public int getJdbcTypeCode() {
                return SqlTypes.NAMED_ENUM;
            }
        });
    }
}